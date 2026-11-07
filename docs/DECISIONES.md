# Decisiones de arquitectura

Registro de decisiones tomadas de forma autónoma (spec §15 y §19). Cada una indica el motivo y cuándo revisarla.

## ADR-01 · Next.js 16 full-stack (App Router + Cache Components)
- **Decisión**: una sola aplicación Next.js sirve tienda, cuenta, administración y API del asistente.
- **Motivo**: SSR y shell estático (rendimiento y SEO), acciones de servidor para mutaciones sin API REST propia, un único despliegue. Menos piezas = menos superficie de fallo.
- **Consecuencia**: datos públicos con `'use cache'` + `cacheTag`; cualquier lectura de sesión dentro de `<Suspense>`. Las acciones de administración invalidan con `updateTag`.
- **Revisar si**: se necesita app móvil nativa (añadir Expo consumiendo Supabase directamente, reutilizando RLS).

## ADR-02 · Supabase como backend gestionado
- **Decisión**: Postgres + Auth + Storage de Supabase, con migraciones versionadas en `supabase/migrations`.
- **Motivo**: escalable, estándar (Postgres), RLS como segunda barrera de autorización, sin servidores que mantener.
- **Defensa en profundidad**: (1) proxy optimista, (2) `requireRole` en cada página/acción, (3) RLS en todas las tablas, (4) restricciones `CHECK` y triggers para invariantes de negocio (pago, publicación, activación de ventas).

## ADR-03 · Venta deshabilitada por diseño
- `brand_settings.sales_enabled` es `false` por defecto y una restricción de base de datos impide activarlo sin responsable legal, fecha de validación, proveedor de verificación de edad, pasarela y regiones.
- Mientras tanto el checkout registra una **intención de compra** (solicitud de atención), nunca un pedido pagable.

## ADR-04 · Pagos: estado controlado, sin pasarela simulada
- No se integra pasarela: la mayoría prohíbe tabaco sin aprobación previa y la marca no ha elegido proveedor.
- `payment_status` solo puede cambiarlo el rol de servicio (futuro webhook firmado). El panel no puede marcar pagos.
- **Pendiente**: elegir pasarela autorizada para tabaco en la jurisdicción, implementar webhook con verificación de firma e idempotencia.

## ADR-05 · Verificación de edad en dos niveles
- Aviso de acceso (declaración) en el sitio: informativo, **no** suficiente para comprar.
- Compra: requiere proveedor de verificación configurado (`age_verification_provider`). Pendiente de selección según normativa local.

## ADR-06 · Asistente con Vercel AI SDK + OpenRouter
- Proveedor de modelos intercambiable por variable de entorno (`ASSISTANT_MODEL`).
- Solo herramientas de **lectura** sobre fuentes oficiales; la derivación humana la completa el usuario con consentimiento explícito en un formulario.
- Los datos de pedidos solo se consultan con la sesión del propio cliente (RLS).

## ADR-07 · Carrito en sessionStorage, precios en servidor
- El carrito es orientativo y vive en la pestaña (se informa al usuario). El servidor recalcula precios, disponibilidad y restricciones al crear el pedido.

## ADR-08 · Limitación de abuso
- Limitador en memoria por IP para formularios, analítica y asistente. **Limitación**: no se comparte entre instancias serverless. Antes de producción con varias instancias, sustituir por almacén compartido (p. ej. Redis gestionado) o la protección del proveedor de hosting.

## ADR-10 · Dirección de arte "Noir Cedro" y modo prototipo
- **Diseño**: lujo editorial oscuro (tokens HSL en `globals.css`), tipografías Instrument Serif + Manrope, vidrio esmerilado, acentos champán y animaciones con `motion` que respetan "reducir movimiento". Es una **propuesta**: se sustituye por el manual de la marca cambiando tokens.
- **Ilustraciones**: vectoriales propias (`scripts/generar-ilustraciones-demo.mjs`), sin humo ni personas fumando, para no glamurizar el consumo.
- **Modo prototipo** (`NEXT_PUBLIC_DEMO_MODE=true`): solo actúa si **no** hay Supabase configurado. Carga contenido ilustrativo (`src/shared/lib/demo/fixtures.ts`), muestra una cinta permanente "Prototipo de demostración" y el checkout termina en una **simulación explícita** que no crea pedidos ni cobra. Nunca activar en producción.

## ADR-09 · Privacidad
- Analítica solo con consentimiento, sin identificadores personales (`analytics_events`).
- El registro de auditoría excluye datos personales (dirección, correo, nombre, mensajes).
- `robots: noindex` mientras el sitio no esté aprobado legalmente para su publicación.
