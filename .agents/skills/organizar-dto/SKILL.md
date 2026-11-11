---
name: organizar-dto
description: Organiza los DTO del backend en el módulo dueño del contrato y ubica la validación de entrada del flujo que se modifica.
---

# Organizar los DTO

Ubicá cada DTO en `dto/` del módulo dueño del contrato. Si el flujo que modificás tiene un DTO declarado dentro del controlador, movelo a `dto/`. Creá la carpeta si hace falta y reutilizá un DTO existente cuando represente el mismo contrato.

Validá el formato de entrada con los mecanismos declarativos del proyecto, como los decoradores de `class-validator` cuando se use esa biblioteca. Las reglas de negocio y las validaciones que necesitan consultar datos quedan en el servicio.
