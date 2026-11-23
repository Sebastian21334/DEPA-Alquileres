import { Injectable } from '@nestjs/common';
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';
import { paginar } from '../../common/persistence/paginacion';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, type EntityManager } from 'typeorm';
import { Usuario } from '../entity/usuario.entity';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import type {
  IUsuariosRepository,
  BloqueoAdministrativo,
  EstadosTramitesPendientes,
  OperacionesPendientesCuenta,
  ParticipacionEnReserva,
} from './usuarios.repository.interface';
import { digitosCuit } from '../../common/utils/cuit';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { Pago } from '../../pagos/entity/pago.entity';
import { Reclamo } from '../../reclamos/entity/reclamo.entity';
import { Reembolso } from '../../reembolsos/entity/reembolso.entity';
import { SolicitudCancelacion } from '../../cancelaciones/entity/solicitud-cancelacion.entity';
import { guardarSinDuplicados } from '../../common/persistence/valor-duplicado.error';

const RESTRICCION_EMAIL_UNICO = 'UQ_2863682842e688ca198eb25c124';

@Injectable()
export class UsuariosRepository implements IUsuariosRepository {
  constructor(@InjectRepository(Usuario) private readonly repo: Repository<Usuario>) {}

  crear(datos: Partial<Usuario>): Usuario {
    return this.repo.create(datos);
  }

  guardar(usuario: Usuario, transaccion?: EntityManager): Promise<Usuario> {
    const repo = transaccion?.getRepository(Usuario) ?? this.repo;
    return guardarSinDuplicados(() => repo.save(usuario), [RESTRICCION_EMAIL_UNICO]);
  }

  conTransaccion<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repo.manager.transaction(operacion);
  }

  buscarBloqueado(idUsuario: number, transaccion: EntityManager, incluirRol = false, incluirCredenciales = false): Promise<Usuario | null> {
    const consulta = transaccion.getRepository(Usuario).createQueryBuilder('usuario')
      .where('usuario.id = :idUsuario', { idUsuario })
      .setLock('pessimistic_write', undefined, ['usuario']);
    if (incluirRol) consulta.leftJoinAndSelect('usuario.rol', 'rol');
    if (incluirCredenciales) consulta.addSelect(['usuario.contrasenia', 'usuario.bloqueoDetalle', 'usuario.version_sesion']);
    return consulta.getOne();
  }

  async contarOperacionesPendientes(idUsuario: number, participacion: ParticipacionEnReserva, hoy: string, limiteCheckout: Date, transaccion: EntityManager, estados: { pagoPendiente: string; pagoAprobado: string; liquidacionesResueltas: string[]; enRevision: string }): Promise<OperacionesPendientesCuenta> {
    const esAnunciante = participacion === 'Anunciante';
    const reservas = () => {
      const consulta = transaccion.getRepository(Reserva).createQueryBuilder('reserva');
      return esAnunciante
        ? consulta.innerJoin('reserva.publicacion', 'publicacion')
            .where('publicacion.id_anunciante = :idUsuario', { idUsuario })
        : consulta.where('reserva.id_usuario = :idUsuario', { idUsuario });
    };

    const reservasPendientes = await reservas()
      .andWhere('reserva.estado_pago = :pendiente', { pendiente: estados.pagoPendiente })
      .getCount();
    const estadiasVigentes = await reservas()
      .andWhere('reserva.estado_pago = :aprobado', { aprobado: estados.pagoAprobado })
      .andWhere('reserva.cancelada = false')
      .andWhere('reserva.finalizada = false')
      .andWhere(`(
        reserva.fecha_inicio IS NULL OR reserva.fecha_fin IS NULL
        OR reserva.fecha_inicio > reserva.fecha_fin
        OR reserva.fecha_fin >= :hoy
      )`, { hoy })
      .getCount();

    const liquidaciones = reservas().leftJoin('reserva.liquidacion', 'liquidacion');
    if (esAnunciante) {
      liquidaciones
        .andWhere('reserva.estado_pago = :aprobado', { aprobado: estados.pagoAprobado })
        .andWhere('(liquidacion.estado IS NULL OR liquidacion.estado NOT IN (:...resueltas))', {
          resueltas: estados.liquidacionesResueltas,
        });
    } else {
      liquidaciones.andWhere('liquidacion.estado = :enRevision', {
        enRevision: estados.enRevision,
      });
    }
    const liquidacionesPendientes = await liquidaciones.getCount();

    const pagos = transaccion.getRepository(Pago).createQueryBuilder('pago')
      .innerJoin('pago.reserva', 'reserva');
    if (esAnunciante) {
      pagos.innerJoin('reserva.publicacion', 'publicacion')
        .where('publicacion.id_anunciante = :idUsuario', { idUsuario });
    } else {
      pagos.where('reserva.id_usuario = :idUsuario', { idUsuario });
    }
    const pagosSinConciliar = await pagos
      .andWhere('pago.status NOT IN (:...finales)', {
        finales: ['approved', 'rejected', 'cancelled', 'refunded'],
      })
      .andWhere('(pago.payment_id IS NOT NULL OR pago.created_at > :limiteCheckout)', { limiteCheckout })
      .getCount();
    return { reservasPendientes, estadiasVigentes, liquidacionesPendientes, pagosSinConciliar };
  }

  buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOneBy({ email });
  }

  tieneTramitesPendientes(idUsuario: number, anuncianteVerificado: boolean, transaccion: EntityManager, estados: EstadosTramitesPendientes): Promise<boolean> {
    const reservas = transaccion.getRepository(Reserva).createQueryBuilder('reserva');
    if (anuncianteVerificado) {
      reservas.leftJoin('reserva.publicacion', 'publicacion')
        .where('(reserva.id_usuario = :idUsuario OR publicacion.id_anunciante = :idUsuario)', { idUsuario });
    } else {
      reservas.where('reserva.id_usuario = :idUsuario', { idUsuario });
    }
    const reclamos = reservas.subQuery().select('1').from(Reclamo, 'reclamo')
      .where('reclamo.id_reserva = reserva.id').andWhere('reclamo.estado IN (:...reclamos)').getQuery();
    const cancelaciones = reservas.subQuery().select('1').from(SolicitudCancelacion, 'solicitud')
      .where('solicitud.id_reserva = reserva.id').andWhere('solicitud.estado = :cancelacion').getQuery();
    const reembolsos = reservas.subQuery().select('1').from(Reembolso, 'reembolso')
      .where('reembolso.id_reserva = reserva.id')
      .andWhere('(reembolso.estado IN (:...reembolsos) OR (reembolso.estado = :reembolsoAprobado AND reembolso.aplicado_en IS NULL))')
      .getQuery();
    return reservas.andWhere(`(EXISTS ${reclamos} OR EXISTS ${cancelaciones} OR EXISTS ${reembolsos})`, { ...estados })
      .getExists();
  }

  buscarBajaRecuperable(email: string): Promise<Usuario | null> {
    return this.repo.findOne({
      select: { id: true },
      where: { email_historico: email, activa: false, bloqueado: false, baja_recuperable: true },
      order: { fecha_baja: 'DESC', id: 'DESC' },
    });
  }

  buscarPorTokenReactivacion(token: string): Promise<Usuario | null> {
    return this.repo.createQueryBuilder('u')
      .select(['u.id', 'u.email_historico', 'u.contrasenia'])
      .where('u.token_recuperacion = :token', { token })
      .andWhere('u.token_recuperacion_expira > :ahora', { ahora: new Date() })
      .andWhere('u.activa = false AND u.bloqueado = false AND u.baja_recuperable = true')
      .getOne();
  }

  async guardarTokenReactivacion(id: number, email: string, token: string, expira: Date): Promise<boolean> {
    const resultado = await this.repo.update(
      { id, email_historico: email, activa: false, bloqueado: false, baja_recuperable: true },
      { token_recuperacion: token, token_recuperacion_expira: expira },
    );
    return resultado.affected === 1;
  }

  async reactivar(id: number, email: string, hashActual: string, token: string, versionSesion: string, transaccion: EntityManager): Promise<boolean> {
    const resultado = await guardarSinDuplicados(() => transaccion.createQueryBuilder()
      .update(Usuario)
      .set({
        email,
        email_verificado: true,
        activa: true,
        fecha_baja: null,
        baja_recuperable: false,
        version_sesion: versionSesion,
        token_verificacion: null,
        token_recuperacion: null,
        token_recuperacion_expira: null,
      })
      .where('id_usuario = :id AND email IS NULL AND email_historico = :email', { id, email })
      .andWhere('contrasenia = :hashActual AND token_recuperacion = :token', { hashActual, token })
      .andWhere('token_recuperacion_expira > :ahora', { ahora: new Date() })
      .andWhere('activa = false AND bloqueado = false AND baja_recuperable = true')
      .execute(), [RESTRICCION_EMAIL_UNICO]);
    return resultado.affected === 1;
  }

  contarUsuarios(): Promise<number> {
    return this.repo.count();
  }

  listarTodos(): Promise<Usuario[]> {
    return this.repo.find({
      relations: { rol: true },
      order: { id: 'ASC' },
    });
  }

  listarAdministracion(consulta: ListarAdministracionDto) {
    const query = this.repo.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      // RN-37: el CUIT/CUIL (vigente o histórico) relaciona las cuentas de una misma persona.
      .leftJoinAndMapOne(
        'usuario.anunciante',
        Anunciante,
        'anunciante',
        'anunciante.id_usuario = usuario.id',
      )
      .orderBy('usuario.id', 'ASC');
    const q = consulta.q?.trim();
    if (q) {
      const digitos = digitosCuit(q);
      query.andWhere(
        new Brackets((busqueda) => {
          busqueda.where(
            "POSITION(:q IN LOWER(CONCAT_WS(' ', usuario.nombre, usuario.apellido, usuario.email, usuario.email_historico))) > 0",
            { q: q.toLowerCase() },
          );
          // Un CUIT/CUIL se encuentra con o sin guiones, vigente o histórico.
          if (digitos.length >= 3) {
            busqueda.orWhere(
              "POSITION(:digitos IN regexp_replace(CONCAT_WS(' ', anunciante.cuit_cuil, anunciante.cuit_cuil_historico), '[^0-9 ]', '', 'g')) > 0",
              { digitos },
            );
          }
        }),
      );
    }
    return paginar(query, consulta);
  }

  async buscarPorId(id: number, transaccion?: EntityManager): Promise<Usuario | null> {
    const repositorio = transaccion ? transaccion.getRepository(Usuario) : this.repo;
    return repositorio.findOne({
      where: { id: id },
      relations: { rol: true },
    });
  }

  async buscarParaLogin(email: string): Promise<Usuario | null> {
    // La contraseña tiene select:false en la entidad y debe pedirse explícitamente solo aquí.
    return (
      this.repo
        .createQueryBuilder('u')
        .addSelect(['u.contrasenia', 'u.bloqueoDetalle', 'u.version_sesion'])
        // El rol se necesita para autorizar la sesión y para incluirlo en el JWT.
        .leftJoinAndSelect('u.rol', 'rol')
        .where('u.email = :email', { email })
        .getOne()
    );
  }

  buscarParaSesion(id: number): Promise<Usuario | null> {
    return this.repo.createQueryBuilder('u')
      .addSelect(['u.version_sesion', 'u.bloqueoDetalle'])
      .leftJoinAndSelect('u.rol', 'rol')
      .where('u.id = :id', { id })
      .getOne();
  }

  buscarConBloqueo(id: number, transaccion?: EntityManager, bloquear = true): Promise<Usuario | null> {
    const consulta = (transaccion?.getRepository(Usuario) ?? this.repo)
      .createQueryBuilder('u').addSelect(['u.bloqueoDetalle', 'u.historialBloqueos']).leftJoinAndSelect('u.rol', 'rol')
      .where('u.id = :id', { id });
    if (transaccion && bloquear) consulta.setLock('pessimistic_write', undefined, ['u']);
    return consulta.getOne();
  }

  listarBloqueados(): Promise<BloqueoAdministrativo[]> {
    return this.repo.createQueryBuilder('u')
      .leftJoin(Usuario, 'operador', "operador.id_usuario = (u.bloqueo_detalle->>'administradorId')::int")
      .select("jsonb_build_object('id', u.id_usuario, 'nombre', u.nombre, 'apellido', u.apellido, 'email', u.email)", 'usuario')
      .addSelect('u.bloqueoDetalle', 'detalle')
      .addSelect("CASE WHEN operador.id_usuario IS NOT NULL THEN jsonb_build_object('nombre', operador.nombre, 'apellido', operador.apellido) END", 'administrador')
      .where('u.activa = true AND u.bloqueado = true AND u.bloqueo_detalle IS NOT NULL')
      .orderBy('u.id', 'DESC')
      .getRawMany<BloqueoAdministrativo>();
  }

  async listarHistorialBloqueos(): Promise<{ usuario: BloqueoAdministrativo['usuario']; historial: import('../entity/usuario.entity').BloqueoHistorico[] }[]> {
    const usuarios = await this.repo.createQueryBuilder('u')
      .select(['u.id', 'u.nombre', 'u.apellido', 'u.email', 'u.historialBloqueos'])
      .where("jsonb_array_length(u.historial_bloqueos) > 0")
      .orderBy('u.id', 'DESC').getMany();
    return usuarios.map(usuario => ({ usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email }, historial: usuario.historialBloqueos ?? [] }));
  }

  async guardarTokenVerificacion(id: number, email: string, token: string): Promise<boolean> {
    const resultado = await this.repo.update(
      { id, email, activa: true, bloqueado: false, email_verificado: false },
      { token_verificacion: token },
    );
    return resultado.affected === 1;
  }

  async verificarCuenta(token: string): Promise<boolean> {
    const resultado = await this.repo.update(
      { token_verificacion: token, activa: true, email_verificado: false },
      { email_verificado: true, token_verificacion: null },
    );
    return resultado.affected === 1;
  }

  async guardarTokenRecuperacion(id: number, email: string, token: string, expira: Date): Promise<boolean> {
    const resultado = await this.repo.update(
      { id, email, activa: true, bloqueado: false },
      { token_recuperacion: token, token_recuperacion_expira: expira },
    );
    return resultado.affected === 1;
  }

  buscarPorTokenRecuperacion(token: string): Promise<Usuario | null> {
    // A diferencia del anterior, acá el service sí necesita leer
    // token_recuperacion_expira para validar la vigencia, así que hay que
    // forzar su selección igual que con la contraseña en buscarParaLogin.
    return this.repo
      .createQueryBuilder('u')
      .addSelect(['u.token_recuperacion', 'u.token_recuperacion_expira'])
      .where('u.token_recuperacion = :token', { token })
      .andWhere('u.activa = true')
      .getOne();
  }

  buscarCredencialesPorId(id: number): Promise<Usuario | null> {
    return this.repo.createQueryBuilder('u')
      .addSelect('u.contrasenia')
      .where('u.id = :id', { id })
      .getOne();
  }

  async cambiarContrasenia(id: number, hashActual: string, nuevoHash: string): Promise<boolean> {
    // Impide sobrescribir otro cambio concurrente e invalida los enlaces pendientes.
    const resultado = await this.repo.createQueryBuilder()
      .update(Usuario)
      .set({ contrasenia: nuevoHash, token_recuperacion: null, token_recuperacion_expira: null })
      .where('id_usuario = :id', { id })
      .andWhere('contrasenia = :hashActual', { hashActual })
      .andWhere('activa = true AND bloqueado = false')
      .execute();
    return resultado.affected === 1;
  }

  async restablecerContrasenia(token: string, nuevoHash: string): Promise<boolean> {
    // El consumo del token y el cambio son atómicos: un enlace solo puede usarse una vez.
    const resultado = await this.repo.createQueryBuilder()
      .update(Usuario)
      .set({ contrasenia: nuevoHash, token_recuperacion: null, token_recuperacion_expira: null })
      .where('token_recuperacion = :token', { token })
      .andWhere('token_recuperacion_expira > :ahora', { ahora: new Date() })
      .andWhere('activa = true AND bloqueado = false')
      .execute();
    return resultado.affected === 1;
  }
}
