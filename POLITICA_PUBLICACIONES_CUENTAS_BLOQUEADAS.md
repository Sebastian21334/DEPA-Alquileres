# Bloqueo de anunciantes e inquilinos

Al bloquear administrativamente una cuenta, el sistema comprueba si tiene reservas pendientes de pago, estadías vigentes o futuras, pagos sin conciliar, reclamos, solicitudes de cancelación, devoluciones o liquidaciones pendientes.

La comprobación incluye las operaciones como inquilino y, si la cuenta tiene un perfil de anunciante verificado, las operaciones de sus publicaciones. El rol de la cuenta se conserva. Durante el acceso limitado se suspenden los permisos administrativos.

Si hay operaciones pendientes, la persona puede iniciar sesión para gestionar sus reservas anteriores, responder en conversaciones existentes y apelar. La API restringe las operaciones de la sesión a estas gestiones. Una conversación por sí sola no extiende el acceso limitado.

El bloqueo impide crear o publicar avisos, hacer nuevas reservas y recibir nuevas cotizaciones o reservas. Los avisos del anunciante bloqueado se ocultan del catálogo, la búsqueda, el perfil público y favoritos. Su enlace público muestra «Publicación no disponible». Los datos se conservan para las operaciones previas y para administración.

Las reservas y pagos iniciados antes del bloqueo conservan su circuito habitual durante el acceso limitado. Las cancelaciones, devoluciones, reclamos y liquidaciones se resuelven por sus procedimientos habituales.

Cuando se resuelve el último pendiente, el servidor cierra el acceso de la cuenta al volver a validar la sesión. La persona puede consultar y apelar el bloqueo desde el inicio de sesión. La apelación es la misma en ambas etapas. Si administración habilita la cuenta, se respetan la pausa voluntaria y el estado individual de cada publicación.

El acceso limitado se registra en el detalle del bloqueo existente. Al iniciar sesión, se vuelven a evaluar los bloqueos anteriores que aún no tienen esa marca, conservando el motivo y la apelación. Cuando se completa el bloqueo total, la decisión queda registrada. Se reutiliza el esquema vigente.
