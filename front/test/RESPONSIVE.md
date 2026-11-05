# Revisión responsive

Para abrir la aplicación con datos ficticios y sin una sesión real:

```sh
npm run preview:responsive
```

La vista está en `http://localhost:4318`. Usa los componentes y rutas reales con
compilación Angular. El interceptor responde en memoria y bloquea las escrituras;
no llama a la API. La configuración de producción conserva su entrada original.
Los mapas y las imágenes externas pueden seguir requiriendo conexión.

Parámetros opcionales: `?sesion=no` muestra la navegación de invitado,
`?rol=Usuario` cambia el rol simulado y `?estado=error` simula errores de la API.

Revisión realizada el 5 de noviembre de 2026:

- Las 21 rutas se comprobaron a 320 y 768 px sin desbordamiento horizontal de página:
  inicio, explorar publicaciones, detalle, perfil público, mi perfil, favoritos,
  dashboard, mis reservas, mis publicaciones, nueva publicación, editar publicación,
  solicitud de anunciante, admin, resultado de reserva, ingreso, registro,
  información para anunciantes, recuperar contraseña, restablecer contraseña,
  verificar cuenta y acceso denegado.
- A 390 px se comprobaron los filtros, la galería y las fichas del administrador.
- A 320 px se abrió el menú y el chat, y se seleccionó un rango en el calendario.
- A 1365 px se comprobaron admin, editar publicación, resultado de reserva,
  detalle de publicación e ingreso.
- Se usaron títulos, nombres y correos largos para detectar tamaños mínimos
  implícitos en las grillas y desbordes de texto.

Las tablas numéricas de cotizaciones conservan su desplazamiento horizontal
dentro del panel. Las tablas de publicaciones y usuarios pasan a fichas a 700 px.

La revisión usa tamaños de navegador: no sustituye una prueba en un teléfono real
con teclado virtual, cámara y Safari. No se realizaron pagos, altas, bajas ni
modificaciones en los datos de producción.
