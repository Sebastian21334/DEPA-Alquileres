---
name: decidir-enum-o-entidad
description: Define cómo modelar estados, tipos y categorías del negocio en el backend. Reutiliza catálogos existentes y consulta antes de crear un enum si el modelado sigue pendiente.
---

# Decidir entre enum y entidad

1. Antes de modelar un estado, tipo o categoría del negocio, identificá el módulo responsable y reutilizá un catálogo existente si representa el concepto. Aplicá las decisiones de modelado ya acordadas.
2. Para estados persistidos, reutilizá el catálogo de estados y su ámbito cuando el proyecto use ese modelo. Si agregás valores obligatorios, incorporalos a la carga inicial.
3. Si el estado se deriva de otros datos, calculalo en el servicio y tipalo en el DTO de respuesta cuando se exponga por la API.
4. Si el modelado de un concepto sigue pendiente y considerás crear un enum, presentá las opciones de enum y entidad antes de editar esa parte. Explicá qué aporta cada opción e indicá qué módulo sería responsable. Priorizá un módulo existente si le corresponde el concepto. Esperá la decisión para esa parte y avanzá con las tareas independientes.
