---
name: verificar-arquitectura-backend
description: Verifica y corrige la comunicación entre módulos, la ubicación de la lógica de negocio y el acceso a datos al implementar, corregir o refactorizar código de un backend con arquitectura modular en capas.
---

# Verificar la arquitectura del backend

## Reglas

- **Controladores.** Para ejecutar lógica de negocio o acceder a datos, el controlador delega en un servicio de su propio módulo.
- **Comunicación entre módulos.** Toda llamada entre componentes de módulos distintos debe ir del servicio que hace el pedido al servicio del módulo que lo resuelve.
- **Lógica de negocio.** Implementá exclusivamente en los servicios los métodos que aplican reglas de negocio, como validar condiciones del dominio, calcular importes o decidir cambios de estado.
- **Entidades.** Las clases de entidad se limitan a declarar campos, relaciones y sus decoradores de mapeo. Al verificar esta regla, revisá también getters, setters, constructores explícitos, métodos estáticos y hooks definidos en la entidad.
- **Acceso a datos.** El servicio delega las lecturas y escrituras en el repositorio de su módulo. El repositorio ejecuta las operaciones de base de datos y puede cargar las entidades relacionadas que requiera la consulta, incluso si pertenecen a otro módulo.

Por ejemplo, si Pedidos necesita consultar el estado de un cliente mediante una operación del módulo Clientes, el flujo es `Servicio de Pedidos → Servicio de Clientes → Repositorio de Clientes`. Al consultar un pedido, el repositorio de Pedidos puede cargar la entidad Cliente asociada al pedido.

## Verificación antes de finalizar

1. Seguí las llamadas de los flujos afectados por la implementación, incluidas las indirectas, y comprobá que cumplan las reglas.
2. Corregí todas las infracciones que encuentres en esos flujos, incluidas las preexistentes. Acotá los cambios a lo necesario para corregirlas.
3. Volvé a revisar los flujos corregidos y ejecutá las pruebas existentes que correspondan.

La implementación se considera terminada cuando los flujos afectados cumplen las reglas. Si una corrección queda bloqueada, indicá qué infracción sigue pendiente y qué impide resolverla.
