# Tienda digital de habanos

Plataforma comercial y de atención: catálogo, ficha de producto, carrito, checkout controlado, cuenta de cliente,
asistente virtual con derivación humana y panel de administración con roles y auditoría.

> **Estado**: base funcional (Fases 1-3 de la especificación). La **venta online está deshabilitada por diseño**
> hasta completar la validación legal, la verificación de edad y la pasarela de pago. Ver [docs/PENDIENTES_MARCA.md](docs/PENDIENTES_MARCA.md).

## Stack
Next.js 16 (App Router, Cache Components) · React 19 · TypeScript estricto · Tailwind v4 · Supabase (Postgres, Auth, Storage, RLS) · Vercel AI SDK 7 + OpenRouter · Zod · Vitest. Justificación en [docs/DECISIONES.md](docs/DECISIONES.md).

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completar credenciales
npm run dev                  # http://localhost:3000
```

Sin credenciales la aplicación arranca igualmente y muestra estados **"pendiente de configuración"**: nunca datos de ejemplo.

### Base de datos (Supabase)
1. Crear un proyecto en Supabase y copiar URL, `anon key` y `service_role key` a `.env.local`.
2. Aplicar el esquema: `npx supabase link --project-ref <ref>` y `npm run db:push`
   (o pegar `supabase/migrations/*.sql` en el SQL Editor).
3. En Authentication → URL Configuration, añadir `${NEXT_PUBLIC_SITE_URL}/auth/confirmar` como URL de redirección.
4. Designar el primer administrador: entrar una vez en `/ingresar` con su correo y ejecutar en el SQL Editor:
   ```sql
   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'persona@marca.com');
   ```
   El resto de roles (`catalogo`, `pedidos`, `atencion`) se asignan desde **/admin/usuarios**.

### Asistente virtual
Definir `OPENROUTER_API_KEY` (y opcionalmente `ASSISTANT_MODEL`). Sin clave, el widget informa que no está disponible y ofrece FAQ y contacto.

## Validación

```bash
npm run validate   # lint + typecheck + tests unitarios + verificación del esquema + build
npm test           # lógica de dominio (Vitest)
npm run test:db    # migración, invariantes y RLS sobre Postgres embebido (PGlite)
```

## Estructura

```
src/
├── app/(tienda)/      Tienda pública (catálogo, producto, carrito, checkout, contenido)
├── app/cuenta/        Área de cliente
├── app/admin/         Panel de administración (protegido por rol)
├── app/api/chat/      Endpoint del asistente
├── features/<módulo>/ domain/ (lógica pura + tests) · data.ts (lecturas) · actions.ts (mutaciones)
├── shared/            Clientes Supabase, utilidades, componentes UI, tipos
└── proxy.ts           Refresco de sesión y comprobación optimista de rutas privadas
supabase/migrations/   Esquema, RLS, triggers de auditoría e invariantes
docs/                  Especificación, decisiones, métricas, pendientes y guía de operación
```

## Metodología
Desarrollado con el kit agéntico `proyectIA-vibe-coding` (PRP + bucle agéntico): plan en
[.claude/PRPs/prp-tienda-habanos-mvp.md](.claude/PRPs/prp-tienda-habanos-mvp.md), reglas en [CLAUDE.md](CLAUDE.md).

## Aviso
Esta plataforma no sustituye asesoría jurídica. La marca debe obtener revisión legal local antes del lanzamiento.
