# Documentación según el tipo de anunciante

El particular presenta CUIT/CUIL personal, contacto, DNI frente/dorso y prueba de
vida. La inmobiliaria informa nombre o razón social, su CUIT, matrícula del
corredor responsable, colegio y jurisdicción, domicilio comercial y DNI del
corredor. Adjunta además constancias de matrícula y CUIT (PDF, JPG o PNG, hasta
5 MB cada una). La persona titular de la cuenta actúa como corredor responsable:
el DNI capturado y la prueba de vida son suyos, no de la organización.

Los datos y adjuntos adicionales pertenecen a la solicitud privada, no al perfil
público del anunciante. Las constancias usan el contenedor privado y accesos
firmados temporales. El administrador consulta todo junto y decide manualmente;
no hay consultas automáticas a padrones profesionales ni a organismos tributarios.
Los datos declarados no prueban por sí solos que la matrícula esté habilitada.

Para corregir datos, el titular puede usar el formulario en borrador o después de
un rechazo. Pendientes y aprobadas no admiten cambios. El servidor vuelve a exigir
los datos y ambas constancias al presentar y al aprobar una inmobiliaria. El
reenvío requiere una prueba de vida y constancias nuevas. Los particulares no
necesitan estos datos adicionales.

## Preparar una base existente

Aplicar primero la migración de verificación de identidad de esta misma fecha.
Con el backend detenido, desde `back`:

```sh
node scripts/documentacion-inmobiliaria.cjs
npm run db:documentacion-inmobiliaria
```

El primer comando consulta columnas; el segundo aplica la migración repetible.
No completa ni altera solicitudes existentes. Si una solicitud antigua de una
inmobiliaria está pendiente e incompleta, el administrador debe rechazarla con un
motivo para permitir completar y reenviar. Las aprobaciones históricas se conservan.
Esta preparación no aplica la política general de eliminación documental, que
sigue siendo una tarea separada.
