import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { AuthController } from '../../../src/auth/controller/auth.controller';
import { AuthService } from '../../../src/auth/service/auth.service';
import { AlmacenamientoService } from '../../../src/almacenamiento/service/almacenamiento.service';
import { Anunciante } from '../../../src/anunciantes/entity/anunciante.entity';
import { BloqueoAnuncianteController } from '../../../src/bloqueo-anunciante/controller/bloqueo-anunciante.controller';
import { BloqueoAnuncianteService } from '../../../src/bloqueo-anunciante/service/bloqueo-anunciante.service';
import { ANUNCIANTES_REPOSITORY } from '../../../src/anunciantes/repository/anunciantes.repository.interface';
import { AnunciantesService } from '../../../src/anunciantes/service/anunciantes.service';
import { Rol } from '../../../src/catalogos/entity/rol.entity';
import { CatalogosService } from '../../../src/catalogos/service/catalogos.service';
import { MAIL_SERVICE } from '../../../src/mail/mail.interface';
import { PublicacionesController } from '../../../src/publicaciones/controller/publicaciones.controller';
import { Publicacion } from '../../../src/publicaciones/entity/publicacion.entity';
import { PUBLICACIONES_REPOSITORY } from '../../../src/publicaciones/repository/publicaciones.repository.interface';
import { PublicacionesService } from '../../../src/publicaciones/service/publicaciones.service';
import { ReservaBloqueoAnuncianteService } from '../../../src/reservas/service/reserva-bloqueo-anunciante.service';
import { SeguridadModule } from '../../../src/seguridad/seguridad.module';
import { UbicacionService } from '../../../src/ubicacion/service/ubicacion.service';
import { UsuariosController } from '../../../src/usuarios/controller/usuarios.controller';
import { Usuario } from '../../../src/usuarios/entity/usuario.entity';
import { BLOQUEO_ANUNCIANTE_REPOSITORY } from '../../../src/bloqueo-anunciante/repository/bloqueo-anunciante.repository.interface';
import { USUARIOS_REPOSITORY } from '../../../src/usuarios/repository/usuarios.repository.interface';
import { UsuariosConsultaService } from '../../../src/usuarios/service/usuarios-consulta.service';
import { UsuariosCredencialesService } from '../../../src/usuarios/service/usuarios-credenciales.service';
import { UsuariosService } from '../../../src/usuarios/service/usuarios.service';
import { UsuariosConsultaModule } from '../../../src/usuarios/usuarios-consulta.module';
import type { EntityManager } from 'typeorm';

/**
 * App de prueba para los casos CP-06, CP-07 y CP-08.
 *
 * Se levanta el backend real en memoria: controllers, ValidationPipe global
 * (con la misma configuración que src/main.ts), guards, estrategia JWT,
 * bcrypt y servicios de negocio. Solo se reemplazan los bordes externos:
 * PostgreSQL (repositorios en memoria), Azure Communication Services (correo)
 * y Azure Blob Storage (archivos). Así los tests son de caja negra sobre la
 * API REST, igual que los casos de prueba, sin tocar la base de Neon.
 */

const ROLES: Record<string, Rol> = {
  Administrador: Object.assign(new Rol(), { id: 1, nombre: 'Administrador' }),
  Inquilino: Object.assign(new Rol(), { id: 2, nombre: 'Inquilino' }),
  Anunciante: Object.assign(new Rol(), { id: 3, nombre: 'Anunciante' }),
};

/** Copia superficial que conserva el prototipo (los métodos de la entidad). */
function copiar<T extends object>(objeto: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(objeto)), objeto);
}

/** Reemplaza la tabla `usuario` de PostgreSQL. */
export class UsuariosEnMemoria {
  conTransaccion<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T> {
    return operacion({} as EntityManager);
  }

  buscarBloqueado(id: number): Promise<Usuario | null> {
    return this.buscarPorId(id);
  }
  readonly filas = new Map<number, Usuario>();
  private ultimoId = 0;

  crear(datos: Partial<Usuario>): Usuario {
    // Valores por defecto de las columnas de la entidad Usuario.
    return Object.assign(new Usuario(), {
      activa: true,
      bloqueado: false,
      email_verificado: false,
      fecha_baja: null,
      email_historico: null,
      foto_url: null,
      ...datos,
    });
  }

  async guardar(usuario: Usuario): Promise<Usuario> {
    if (!usuario.id) usuario.id = ++this.ultimoId;
    const anterior = this.filas.get(usuario.id);
    // La contraseña tiene select:false: un guardado sin ella no la borra.
    const fila = copiar(usuario);
    if (fila.contrasenia === undefined && anterior) fila.contrasenia = anterior.contrasenia;
    this.filas.set(usuario.id, fila);
    return usuario;
  }

  private sinContrasenia(usuario: Usuario | undefined): Usuario | null {
    if (!usuario) return null;
    const copia = copiar(usuario);
    delete (copia as Partial<Usuario>).contrasenia;
    return copia;
  }

  private buscar(predicado: (u: Usuario) => boolean): Usuario | undefined {
    return [...this.filas.values()].find(predicado);
  }

  async buscarPorEmail(email: string) {
    return this.sinContrasenia(this.buscar((u) => u.email === email));
  }

  async buscarPorId(id: number) {
    return this.sinContrasenia(this.filas.get(id));
  }

  async buscarParaLogin(email: string) {
    const usuario = this.buscar((u) => u.email === email);
    return usuario ? copiar(usuario) : null;
  }

  async buscarCredencialesPorId(id: number) {
    const usuario = this.filas.get(id);
    return usuario ? copiar(usuario) : null;
  }

  async buscarPorTokenVerificacion(token: string) {
    return this.sinContrasenia(this.buscar((u) => u.token_verificacion === token));
  }

  async contarUsuarios() {
    return this.filas.size;
  }

  async listarTodos() {
    return [...this.filas.values()].map((u) => this.sinContrasenia(u) as Usuario);
  }

  /** Lectura directa de la "base" para verificar resultados persistidos. */
  porEmail(email: string): Usuario | undefined {
    return this.buscar((u) => u.email === email);
  }
}

/** Reemplaza la tabla `publicacion` de PostgreSQL. */
export class PublicacionesEnMemoria {
  async bloquearPorAnunciante(id: number): Promise<boolean> {
    return [...this.filas.values()].some((publicacion) => publicacion.anunciante?.idUsuario === id);
  }
  readonly filas = new Map<number, Publicacion>();

  async buscarPorId(id: number) {
    const publicacion = this.filas.get(id);
    return publicacion ? copiar(publicacion) : null;
  }

  async guardar(publicacion: Publicacion) {
    this.filas.set(publicacion.id, copiar(publicacion));
    return publicacion;
  }

  async actualizarSiNoEliminada(id: number, cambios: Partial<Publicacion>): Promise<boolean> {
    const actual = this.filas.get(id);
    if (!actual || actual.eliminada) return false;
    Object.assign(actual, cambios);
    return true;
  }
}

/** Reemplaza Azure Communication Services: guarda los correos "enviados". */
export class CorreoEnMemoria {
  readonly enviados: { metodo: string; destinatario: unknown; args: unknown[] }[] = [];

  /** Token del último enlace de verificación enviado a ese correo. */
  tokenVerificacion(email: string): string | undefined {
    const correo = [...this.enviados]
      .reverse()
      .find((c) => c.metodo === 'enviarVerificacion' && c.destinatario === email);
    return correo?.args[1] as string | undefined;
  }

  servicio() {
    return new Proxy(
      {},
      {
        // Solo los métodos "enviar..." de IMailService. Cualquier otra propiedad
        // (por ejemplo `then` u onModuleInit, que Nest consulta) queda indefinida.
        get: (_objetivo, metodo: string | symbol) =>
          typeof metodo === 'string' && metodo.startsWith('enviar')
            ? async (...args: unknown[]) => {
                this.enviados.push({ metodo, destinatario: args[0], args });
              }
            : undefined,
      },
    );
  }
}

export interface AppDePrueba {
  app: INestApplication;
  usuarios: UsuariosEnMemoria;
  publicaciones: PublicacionesEnMemoria;
  anunciantes: Map<number, Anunciante>;
  correo: CorreoEnMemoria;
  /** Inserta un usuario directamente en la "base" (precondiciones). */
  crearUsuario(datos: { nombre: string; apellido?: string; email: string; contrasenia: string; rol: keyof typeof ROLES; emailVerificado?: boolean; }): Promise<Usuario>;
  cerrar(): Promise<void>;
}

export async function crearAppDePrueba(): Promise<AppDePrueba> {
  process.env.JWT_SECRET ??= 'secreto-solo-para-tests-jest';
  process.env.JWT_EXPIRES_SEC ??= '3600';
  process.env.BCRYPT_COST ??= '12';

  const usuarios = new UsuariosEnMemoria();
  const publicaciones = new PublicacionesEnMemoria();
  const anunciantes = new Map<number, Anunciante>();
  const correo = new CorreoEnMemoria();
  const usuariosRepository = { provide: USUARIOS_REPOSITORY, useValue: usuarios };

  @Module({
    providers: [UsuariosConsultaService, usuariosRepository],
    exports: [UsuariosConsultaService],
  })
  class UsuariosConsultaEnMemoriaModule {}

  const catalogos = {
    codigoEstado: (_ambito: string, codigo: string) => codigo,
    getRolPorNombre: async (nombre: string) => ROLES[nombre] ?? null,
    crearRol: async ({ nombre }: { nombre: string }) => ROLES[nombre],
  };

  const modulo = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), SeguridadModule],
    controllers: [
      AuthController,
      UsuariosController,
      PublicacionesController,
      BloqueoAnuncianteController,
    ],
    providers: [
      AuthService,
      UsuariosService,
      UsuariosCredencialesService,
      AnunciantesService,
      PublicacionesService,
      BloqueoAnuncianteService,
      { provide: BLOQUEO_ANUNCIANTE_REPOSITORY, useValue: usuarios },
      usuariosRepository,
      { provide: PUBLICACIONES_REPOSITORY, useValue: publicaciones },
      {
        provide: ANUNCIANTES_REPOSITORY,
        useValue: { buscarPorUsuario: async (id: number) => anunciantes.get(id) ?? null },
      },
      { provide: CatalogosService, useValue: catalogos },
      { provide: UbicacionService, useValue: {} },
      { provide: MAIL_SERVICE, useValue: correo.servicio() },
      { provide: AlmacenamientoService, useValue: {} },
      {
        provide: ReservaBloqueoAnuncianteService,
        useValue: {
          cancelarReservasPorBloqueoAnunciante: async () => ({
            canceladasPendientes: 0,
            canceladasConDevolucion: 0,
            enRevision: 0,
            sinAccion: 0,
            fallidas: 0,
            detalles: [],
          }),
        },
      },
    ],
  })
    .overrideModule(UsuariosConsultaModule)
    .useModule(UsuariosConsultaEnMemoriaModule)
    .compile();

  const app = modulo.createNestApplication({ logger: false });
  // Misma validación global que src/main.ts.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();

  return {
    app,
    usuarios,
    publicaciones,
    anunciantes,
    correo,
    async crearUsuario(datos) {
      const usuario = usuarios.crear({
        nombre: datos.nombre,
        apellido: datos.apellido ?? 'Prueba',
        email: datos.email,
        telefono: '3534000000',
        contrasenia: await bcrypt.hash(datos.contrasenia, 4),
        rol: ROLES[datos.rol],
        email_verificado: datos.emailVerificado ?? true,
      });
      await usuarios.guardar(usuario);
      return usuario;
    },
    cerrar: () => app.close(),
  };
}

/** Compara mensajes sin distinguir mayúsculas ni tildes ("inválidas" = "invalidas"). */
export function normalizar(texto: unknown): string {
  const plano = Array.isArray(texto) ? texto.join(' | ') : String(texto ?? '');
  return plano.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}
