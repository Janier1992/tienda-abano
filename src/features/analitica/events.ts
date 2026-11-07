// Eventos permitidos (ver docs/METRICAS.md). Sin identificadores personales.
export const EVENT_NAMES = [
  'ver_producto', 'busqueda', 'busqueda_sin_resultados', 'agregar_carrito', 'retirar_carrito',
  'inicio_checkout', 'checkout_bloqueado', 'pedido_iniciado', 'consulta_iniciada', 'asistente_mensaje', 'asistente_derivacion',
] as const

export type EventName = (typeof EVENT_NAMES)[number]
