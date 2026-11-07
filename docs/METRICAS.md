# Métricas de negocio (spec §14)

Fuente: tabla `analytics_events` (solo con consentimiento, sin datos personales), `orders` y `support_requests`.
Responsable propuesto entre paréntesis; **a confirmar por la marca**.

| Métrica | Fórmula | Evento / origen | Responsable |
|---|---|---|---|
| Visualizaciones de ficha | count(`ver_producto`) por producto | `analytics_events` | Catálogo |
| Búsquedas sin resultados | count(`busqueda_sin_resultados`) / count(`busqueda`) | `analytics_events` | Catálogo |
| Agregados al carrito | count(`agregar_carrito`) | `analytics_events` | Comercial |
| Inicio de checkout | count(`inicio_checkout`) / sesiones con `agregar_carrito` | `analytics_events` | Comercial |
| Checkout bloqueado | count(`checkout_bloqueado`) por motivo (`props.motivo`) | `analytics_events` | Cumplimiento |
| Abandono de checkout | 1 − count(`pedido_iniciado`) / count(`inicio_checkout`) | `analytics_events` | Comercial |
| Pedidos confirmados | count(`orders` con `payment_status = 'confirmado'`) | `orders` | Pedidos |
| Conversión | pedidos confirmados / visitas con consentimiento | `orders` + eventos | Comercial |
| Errores de pago | count(`orders` con `payment_status = 'rechazado'`) | `orders` | Pedidos |
| Consultas iniciadas | count(`support_requests`) por `type` y `context.origin` | `support_requests` | Atención |
| Consultas resueltas | count(`status = 'resuelto'`) / total | `support_requests` | Atención |
| Transferencias del asistente | count(`asistente_derivacion`) / count(`asistente_mensaje`) | `analytics_events` | Atención |
| Intenciones de compra | count(`type = 'intencion_compra'`) | `support_requests` | Comercial |
| Incidencias de pedido | count(`orders.status = 'incidencia'`) | `orders` | Pedidos |

**Pendientes de implementar**: tiempo de primera respuesta del asistente (requiere instrumentar latencia en `/api/chat`), satisfacción voluntaria (encuesta opcional tras resolver una consulta).

No optimizar solo por conversión: revisar junto a reclamaciones, consultas sin resolver y bloqueos por cumplimiento.
