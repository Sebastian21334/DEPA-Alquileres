---
name: reutilizar-capas-backend
description: Reutiliza los controladores, servicios y repositorios existentes al modificar un backend modular en capas. Comprueba si cada archivo nuevo tiene una responsabilidad que justifica crearlo.
---

# Reutilizar las capas del backend

Antes de crear un archivo, revisá el controlador, el servicio y el repositorio del módulo. Aprovechá el controlador existente para manejar la entrada y la respuesta HTTP, el servicio para la lógica de negocio y el repositorio para el acceso a datos.

Creá un archivo adicional solo si el cambio lo requiere, por ejemplo para un DTO nuevo, un requisito del framework o una responsabilidad que deba mantenerse separada de esas capas.

Aplicá la regla de entidades de [verificar-arquitectura-backend](../verificar-arquitectura-backend/SKILL.md). Las entidades se limitan a campos, relaciones y decoradores de mapeo.
