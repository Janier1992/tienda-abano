name: "PRP — Tienda digital de habanos (MVP Fases 1-3)"
fuente: instruccion_tienda_digital_habanos.md (especificación maestra)

## Goal
Plataforma comercial y de atención para una marca de habanos: catálogo, ficha, carrito,
checkout controlado, cuenta, asistente virtual con derivación humana, panel de administración
con roles y auditoría. Todo dato comercial proviene de fuentes administrables; nada se inventa.

## Why
- Reducir oportunidades perdidas por demoras o fricción (spec §2).
- Centralizar consultas, intenciones de compra y pedidos con estados distinguibles (spec §7).
- Cumplir restricciones legales: la venta queda deshabilitada hasta validación (spec §10).

## Decisiones de arquitectura (ver docs/DECISIONES.md)
| Capa | Elección | Motivo |
|------|----------|--------|
| Web/SSR | Next.js (App Router) + TypeScript | SSR/ISR para SEO y rendimiento, server actions, un solo despliegue |
| Estilos | Tailwind + tokens HSL | Consistencia, tema sobrio, sin dependencias de UI pesadas |
| Backend | Supabase (Postgres, Auth, Storage, RLS) | Escalable, RLS como segunda barrera, migraciones versionadas |
| Asistente | Vercel AI SDK + OpenRouter | Streaming, tool-calling tipado, proveedor intercambiable |
| Validación | Zod | Esquemas compartidos cliente/servidor |
| Pruebas | Vitest | Lógica de dominio pura y rápida de probar |

## Reglas de negocio críticas (invariantes)
1. `brand_settings.sales_enabled = false` por defecto → el checkout nunca crea un pedido pagable;
   ofrece registrar una **intención de compra** (support_request), distinta de un pedido.
2. Activar ventas exige responsable legal + fecha de validación + proveedor de verificación de edad
   + proveedor de pago configurados (check en DB y en servidor).
3. Los precios del pedido se recalculan en servidor desde la DB; el carrito del cliente no es fuente de verdad.
4. `payment_status` solo lo cambia el rol de servicio (webhook de pasarela). El panel no puede marcar pagos.
5. Producto sin precio/imagen/descripción = incompleto → no publicable.
6. El asistente solo responde con datos de herramientas (DB); sin dato → lo dice y ofrece asesor.
7. Ningún contenido de visitante altera reglas (prompt injection): las herramientas validan permisos.

## Modelo de datos (supabase/migrations)
brand_settings · categories · products · product_images · services · faqs · content_pages ·
profiles(role) · orders · order_items · support_requests · support_notes · audit_log · analytics_events

## Tareas (orden de ejecución)
1. Andamiaje Next.js + estructura `features/` y `shared/` (bootstrap del kit).
2. Migración SQL: tablas, enums, RLS, triggers de auditoría, función `has_role`.
3. Capa shared: clientes Supabase (server/browser/service), config, dinero, logger, UI base.
4. Dominio puro + tests: carrito, búsqueda tolerante, completitud, gating de venta.
5. Tienda: inicio, catálogo (búsqueda/filtros), ficha, carrito, checkout, servicios, contacto, políticas.
6. Cumplimiento: aviso de edad, banner de consentimiento, estados de venta deshabilitada.
7. Cuenta: login (magic link), pedidos propios, solicitudes, preferencias.
8. Atención: formulario de consulta con contexto (producto/carrito/pedido).
9. Asistente: /api/chat, herramientas, límites, derivación humana, estado sin configurar.
10. Admin: dashboard, productos, pedidos, consultas, contenido, configuración, auditoría.
11. Validación: lint, typecheck, tests, build.

## Validation Loop
```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Fuera de alcance de esta iteración (pendiente)
Pasarela de pago real · proveedor de verificación de edad · cálculo de envío/impuestos por zona ·
notificaciones por email · contenido real de la marca · revisión legal.
