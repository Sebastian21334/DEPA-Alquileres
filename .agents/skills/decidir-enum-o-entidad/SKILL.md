---
name: decidir-enum-o-entidad
description: Consulta al usuario antes de crear un enum para un concepto del negocio que pueda modelarse como entidad, como un estado, tipo o categoría, en módulos nuevos o existentes del backend.
---

# Decidir entre enum y entidad

1. Cuando consideres crear un enum para un concepto del negocio, revisá si ya existe una entidad que lo represente y qué módulo es responsable de ese concepto.
2. Antes de editar, presentá al usuario las opciones de enum y entidad. Recomendá modelarlo como entidad y explicá brevemente qué aporta en ese caso. Si ya existe una entidad adecuada, proponé reutilizarla.
3. Indicá en qué módulo quedaría la entidad. Priorizá el módulo existente responsable del concepto. Proponé un módulo nuevo si el concepto tiene una responsabilidad propia y ninguno de los módulos actuales encaja.
4. Esperá la decisión del usuario y aplicá la opción elegida.
