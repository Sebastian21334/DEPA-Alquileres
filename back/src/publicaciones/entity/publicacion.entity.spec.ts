import { Publicacion } from './publicacion.entity';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Ciudad } from '../../ubicacion/entity/ciudad.entity';
import { Imagen } from '../../imagenes/entity/imagen.entity';

const publicacion = () =>
  Object.assign(new Publicacion(), {
    titulo: 'Casa',
    direccion: 'San Martín 100',
    activa: true,
    motivo_baja_admin: null,
    ciudad: Object.assign(new Ciudad(), { nombre: 'Villa María' }),
    anunciante: Object.assign(new Anunciante(), {
      idUsuario: 7,
      numero_contacto: null,
      usuario: Object.assign(new Usuario(), {
        nombre: 'Ana',
        apellido: 'Pérez',
        email: 'ana@example.test',
        telefono: '351000',
      }),
    }),
  });

describe('Publicacion', () => {
  it('decide la propiedad en un único lugar, también desde sus imágenes', () => {
    const item = publicacion();
    expect(item.perteneceA(7)).toBe(true);
    expect(item.perteneceA(8)).toBe(false);
    expect(
      Object.assign(new Imagen(), { publicacion: item }).perteneceA(7),
    ).toBe(true);
    expect(new Imagen().perteneceA(7)).toBe(false);
  });

  it('responde los datos del anunciante sin exponer el grafo de entidades', () => {
    const item = publicacion();
    expect(item.emailDelAnunciante()).toBe('ana@example.test');
    expect(item.nombreDelAnunciante()).toBe('Ana Pérez');
    expect(item.telefonoDelAnunciante()).toBe('351000');
    expect(item.direccionCompleta()).toBe('San Martín 100, Villa María');
  });

  it('modifica solo los datos informados', () => {
    const item = publicacion();
    item.modificar({ titulo: 'Casa nueva', direccion: undefined });
    expect(item.titulo).toBe('Casa nueva');
    expect(item.direccion).toBe('San Martín 100');
  });

  it('registra la baja administrativa', () => {
    const item = publicacion();
    item.darDeBaja('Datos falsos');
    expect(item.activa).toBe(false);
    expect(item.estaDadaDeBajaPorAdministrador()).toBe(true);
  });
});
