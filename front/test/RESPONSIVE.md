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
`?anunciante=no` simula un inquilino sin solicitud de anunciante y
`?anunciante=pendiente` simula una solicitud aún sin aprobar. En ambos casos,
Mis reservas debe mostrar únicamente las reservas realizadas.
`?publicacionesPerfil=14` muestra 14 propiedades en el perfil del anunciante para
probar su paginación (6 por página). Acepta entre 0 y 60; `pagina=2` abre la segunda página.

En `/mis-reservas?rol=Usuario&anunciante=no&cancelacion=sin-devolucion`, la reserva
#3 ingresa mañana: permite enviar la solicitud y muestra el 0 % con advertencia.
Con `cancelacion=iniciada`, ingresa hoy y no ofrece solicitar la cancelación.
Los envíos de esta vista se guardan únicamente en memoria, sin llamar a la API.

Avisos por correo: `/mis-reservas?vista=reclamos&reserva=1` abre Reclamos en «Como anunciante» con
el reclamo #51 resaltado y `/admin?reserva=1#reclamos` lo abre en el panel admin;
`/dashboard#historial-liquidaciones` baja hasta el historial y
`/publicaciones/1?chat=8` abre la conversación con Pedro. Con `sesion=no` o `sesion=vencida`,
esas rutas piden ingresar y conservan el destino en `returnUrl`.

El asistente responde siempre con las cuatro publicaciones de prueba. Desde `/publicaciones/1`, tocar
un resultado tiene que mostrar esa otra publicación, no solo cambiar la URL.

Para T39, usar `/mis-reservas?rol=Anunciante&cancelacion=anunciante-ingreso`
y abrir **Reservas recibidas**. La reserva #3 permite solicitar la cancelación
el día del ingreso, con devolución del 100 % al inquilino. Con
`cancelacion=anunciante-posterior`, el ingreso fue ayer; con
`cancelacion=anunciante-validada`, el código ya está validado y no se ofrece cancelar.

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
