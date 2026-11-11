---
name: implementacion-segura
description: "Implementa funcionalidades, corrige errores o refactoriza código con alcance acotado. Usala al modificar una aplicación o biblioteca. Reservala para tareas con cambios de código."
---

# Implementación segura

## Entendé el cambio y aplicá las skills en orden

Confirmá el resultado esperado, leé las reglas del repositorio y seguí el flujo afectado. Si corregís un error, buscá la causa e intentá reproducirlo cuando sea viable.

Leé el `SKILL.md` de cada skill aplicable y seguí sus instrucciones en este orden.

1. **`verificar-arquitectura-backend`.** Si modificás un backend modular en capas, aplicá sus reglas desde el diseño.
2. **`reutilizar-capas-backend`.** Si modificás un backend modular en capas, revisá qué archivos existentes podés reutilizar antes de crear otros.
3. **`organizar-dto`.** Si el flujo del backend requiere crear o modificar un DTO, o tiene uno declarado en el controlador, aplicá las reglas de ubicación y validación del contrato.
4. **`decidir-enum-o-entidad`.** Si modelás estados, tipos o categorías del negocio, revisá los catálogos y las decisiones existentes. Consultá antes de crear un enum si el modelado sigue pendiente.
5. **`verificar-seguridad-del-cambio`.** Si el cambio toca entradas externas, permisos, contratos HTTP, datos sensibles o integraciones, aplicá sus controles al flujo afectado.

## Mantené el alcance

- Hacé el cambio más simple que resuelva el pedido completo. Confirmá los contratos, seguí las convenciones y reutilizá lo que ya existe. Creá abstracciones para responsabilidades compartidas concretas.
- Preservá la compatibilidad, los datos y el trabajo previo del usuario. Aclará las decisiones pendientes que cambien reglas de negocio, contratos públicos o arquitectura. Ejecutá despliegues, migraciones sobre datos reales y otras acciones externas con la autorización correspondiente.
- Corregí las infracciones de arquitectura de los flujos afectados, incluidas las preexistentes, según `verificar-arquitectura-backend`. Informá por separado los problemas ajenos al cambio.
- Cuando varias escrituras en la misma base formen una sola operación, usá una transacción.
- Escribí las firmas de los métodos de interfaz y de implementación que agregues o modifiques en una sola línea. Incluí la llave de apertura `{` en esa línea cuando corresponda. Conservá el formato habitual del cuerpo y revisá las firmas después de formatear.

## Verificá y entregá

- Completá primero la verificación de arquitectura y luego la de seguridad, cuando correspondan. Si una corrección altera un flujo ya verificado, volvé a comprobar las reglas afectadas.
- Ejecutá las pruebas pertinentes y los controles del proyecto. Si algo falla, corregí la causa y preservá la cobertura y los controles. Revisá que el diff resuelva el pedido completo y respete el alcance.
- Si el flujo afectado realiza varias escrituras como una sola operación, verificá que un fallo intermedio revierta los cambios y permita reintentar. Probá solicitudes simultáneas si pueden afectar el mismo recurso.
- Si cambia el esquema, probá la migración sobre una base descartable con datos de la versión anterior. Si cambia la carga inicial, ejecutala dos veces y comprobá que preserve los datos existentes y que la segunda ejecución no genere duplicados.
- Resumí qué cambió, qué verificaste y qué quedó pendiente, con el motivo.
