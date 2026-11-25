import { filtrarReservasPorCuenta } from '../../common/persistence/participacion-en-reserva';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository, type EntityManager, type FindOptionsRelations } from 'typeorm';
import type { Usuario } from '../../usuarios/entity/usuario.entity';
import { Reclamo } from '../entity/reclamo.entity';
import { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import { ReclamoMensaje } from '../entity/reclamo-mensaje.entity';
import type { IReclamosRepository } from './reclamos.repository.interface';

const RELACIONES_RECLAMO: FindOptionsRelations<Reclamo> = {
  reserva: { liquidacion: true, publicacion: { anunciante: { usuario: true } }, usuario: true },
  inquilino: true,
  anunciante: true,
  // Autor y mensaje de cada imagen; la respuesta los reduce a lo mínimo.
  evidencias: { usuario: { rol: true }, mensaje: true },
  mensajes: { autor: { rol: true } },
};

@Injectable()
export class ReclamosRepository implements IReclamosRepository {
  constructor(@InjectRepository(Reclamo) private readonly reclamos: Repository<Reclamo>, @InjectRepository(ReclamoEvidencia) private readonly evidencias: Repository<ReclamoEvidencia>, @InjectRepository(ReclamoMensaje) private readonly mensajes: Repository<ReclamoMensaje>) {}

  enTransaccion(transaccion: EntityManager): IReclamosRepository {
    return new ReclamosRepository(
      transaccion.getRepository(Reclamo),
      transaccion.getRepository(ReclamoEvidencia),
      transaccion.getRepository(ReclamoMensaje),
    );
  }

  transaccion<T>(trabajo: (reclamos: IReclamosRepository) => Promise<T>): Promise<T> {
    return this.reclamos.manager.transaction((transaccion) => trabajo(this.enTransaccion(transaccion)));
  }

  buscarBloqueado(idReclamo: number): Promise<Reclamo | null> {
    return this.reclamos.findOne({ where: { id: idReclamo }, lock: { mode: 'pessimistic_write' } });
  }

  existeAbierto(idReserva: number, estados: string[], excluirCategoria?: Reclamo['categoria']): Promise<boolean> {
    return this.reclamos.existsBy({
      reserva: { id: idReserva },
      estado: In(estados),
      ...(excluirCategoria ? { categoria: Not(excluirCategoria) } : {}),
    });
  }

  guardar(reclamo: Partial<Reclamo>): Promise<Reclamo> {
    return this.reclamos.save(this.reclamos.create(reclamo));
  }

  listarPorParticipante(idUsuario: number): Promise<Reclamo[]> {
    return this.reclamos.find({
      where: [{ inquilino: { id: idUsuario } }, { anunciante: { id: idUsuario } }],
      relations: RELACIONES_RECLAMO,
      order: { id: 'DESC' },
    });
  }

  listarPorReservas(ids: number[]): Promise<Reclamo[]> {
    if (!ids.length) return Promise.resolve([]);
    return this.reclamos.find({
      where: { reserva: { id: In(ids) } },
      select: { id: true, categoria: true, estado: true, resolucion: true, motivo_resolucion: true, solicitud_cancelacion_id: true, creado_en: true, reserva: { id: true } },
      relations: { reserva: true },
      order: { creado_en: 'DESC', id: 'DESC' },
    });
  }

  async listarAdministracion(): Promise<Reclamo[]> {
    const reclamos = await this.reclamos.find({
      relations: {
        ...RELACIONES_RECLAMO,
        reserva: { liquidacion: true, publicacion: { imagenes: true, anunciante: { usuario: true } }, usuario: true },
      },
      order: { id: 'DESC' },
      take: 200,
    });
    for (const reclamo of reclamos) {
      reclamo.reserva?.publicacion?.imagenes?.sort((a, b) => a.orden - b.orden || a.id - b.id);
    }
    return reclamos;
  }

  buscarPorId(id: number): Promise<Reclamo | null> {
    return this.reclamos.findOne({
      where: { id },
      relations: RELACIONES_RECLAMO,
    });
  }

  contarEvidencias(idReclamo: number): Promise<number> {
    return this.evidencias.countBy({ reclamo: { id: idReclamo } });
  }

  guardarEvidencias(evidencias: Partial<ReclamoEvidencia>[]): Promise<ReclamoEvidencia[]> {
    return this.evidencias.save(this.evidencias.create(evidencias));
  }

  async guardarMensaje(mensaje: Omit<Partial<ReclamoMensaje>, 'autor'> & { autor: Pick<Usuario, 'id'> }): Promise<ReclamoMensaje> {
    const guardado = await this.mensajes.save(this.mensajes.create(mensaje));
    return this.mensajes.findOneOrFail({
      where: { id: guardado.id },
      select: { autor: { id: true, nombre: true, apellido: true, rol: { id: true, nombre: true } } },
      relations: { autor: { rol: true } },
    });
  }

  /** Comprueba si existe un reclamo que coincida con los estados y la participación de la cuenta. */
  tienePendientesDeCuenta(idUsuario: number, anuncianteVerificado: boolean, transaccion: EntityManager, estados: string[]): Promise<boolean> {
    // El reclamo se vincula a la cuenta a través de la reserva. Los estados llegan del catálogo.
    const consulta = transaccion.getRepository(Reclamo).createQueryBuilder('tramite')
      .innerJoin('tramite.reserva', 'reserva')
      .andWhere('tramite.estado IN (:...estados)', { estados });
    // Para un anunciante verificado también se incluyen reservas de sus publicaciones. Solo se consulta si existe algún reclamo.
    return filtrarReservasPorCuenta(consulta, idUsuario, anuncianteVerificado ? 'Ambos' : 'Inquilino').getExists();
  }

}
