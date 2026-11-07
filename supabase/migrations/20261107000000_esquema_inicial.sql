-- Esquema inicial de la tienda. Toda tabla expuesta tiene RLS.
-- Las escrituras sensibles (pedidos, pagos, consultas) se hacen desde el servidor con service_role.

create extension if not exists pg_trgm;

-- ───────────── Tipos ─────────────
create type staff_role as enum ('cliente', 'admin', 'catalogo', 'pedidos', 'atencion');
create type stock_status as enum ('pendiente', 'disponible', 'agotado', 'consultar');
create type order_status as enum ('iniciado', 'pendiente_pago', 'pago_confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado', 'incidencia');
create type payment_status as enum ('no_iniciado', 'pendiente', 'confirmado', 'rechazado');
create type request_type as enum ('consulta', 'intencion_compra', 'soporte_pedido', 'reclamacion', 'derivacion_asistente');
create type request_status as enum ('nuevo', 'asignado', 'en_curso', 'resuelto');

-- ───────────── Perfiles y roles ─────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role staff_role not null default 'cliente',
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now()
);

-- Crea el perfil al registrarse un usuario
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Comprueba si el usuario actual tiene alguno de los roles indicados (admin siempre pasa)
create function has_role(roles staff_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and (role = 'admin' or role = any(roles))
  );
$$;

-- Impide que un usuario se cambie el rol a sí mismo. El operador de la base (SQL editor) y el
-- rol de servicio sí pueden, para poder designar al primer administrador.
create function guard_profile_role() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if new.role is distinct from old.role
     and not has_role(array['admin']::staff_role[])
     and coalesce(auth.role(), '') <> 'service_role'
     and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'Solo un administrador puede cambiar roles';
  end if;
  return new;
end $$;

create trigger profiles_guard_role before update on profiles
  for each row execute function guard_profile_role();

-- ───────────── Configuración de marca y cumplimiento ─────────────
create table brand_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'Marca pendiente de configuración',
  tagline text,
  description text,
  currency char(3) not null default 'EUR',
  min_age int not null default 18 check (min_age >= 18),
  allowed_regions text[] not null default '{}',
  support_hours text,
  support_email text,
  support_phone text,
  -- Venta deshabilitada hasta validación legal explícita
  sales_enabled boolean not null default false,
  legal_responsible text,
  legal_validated_at timestamptz,
  age_verification_provider text,
  payment_provider text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint sales_requires_validation check (
    not sales_enabled or (
      legal_responsible is not null and legal_validated_at is not null
      and age_verification_provider is not null and payment_provider is not null
      and cardinality(allowed_regions) > 0
    )
  )
);
insert into brand_settings (id) values (1);

-- ───────────── Catálogo ─────────────
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  position int not null default 0,
  active boolean not null default true
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  category_id uuid references categories(id) on delete set null,
  description text,
  presentation text,
  price_cents int check (price_cents is null or price_cents >= 0),
  stock_status stock_status not null default 'pendiente',
  compliance_notice text,
  -- Regiones donde no puede ofrecerse aunque la venta esté habilitada
  blocked_regions text[] not null default '{}',
  active boolean not null default false,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- No se publica un producto sin los datos mínimos verificados
  constraint active_requires_data check (
    not active or (description is not null and price_cents is not null and stock_status <> 'pendiente')
  )
);
create index products_category_idx on products(category_id);
create index products_name_trgm_idx on products using gin (name gin_trgm_ops);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text not null,
  position int not null default 0
);
create index product_images_product_idx on product_images(product_id);

-- ───────────── Contenido institucional ─────────────
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  conditions text,
  availability text,
  published boolean not null default false,
  responsible text not null,
  updated_at timestamptz not null default now()
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  position int not null default 0,
  published boolean not null default false,
  responsible text not null,
  updated_at timestamptz not null default now()
);

create table content_pages (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  body text not null,
  published boolean not null default false,
  responsible text not null,
  updated_at timestamptz not null default now()
);

-- ───────────── Pedidos ─────────────
create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default upper(substr(md5(gen_random_uuid()::text), 1, 10)),
  customer_id uuid references auth.users(id) on delete set null,
  contact_email text not null,
  contact_name text not null,
  shipping_address jsonb not null,
  region text not null,
  status order_status not null default 'iniciado',
  payment_status payment_status not null default 'no_iniciado',
  payment_reference text,
  age_verified_at timestamptz,
  subtotal_cents int not null check (subtotal_cents >= 0),
  shipping_cents int,
  tax_cents int,
  total_cents int,
  currency char(3) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Un pedido no avanza a estados posteriores al pago sin pago confirmado
  constraint paid_states_require_payment check (
    status not in ('pago_confirmado', 'en_preparacion', 'enviado', 'entregado') or payment_status = 'confirmado'
  )
);
create index orders_customer_idx on orders(customer_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  unit_price_cents int not null check (unit_price_cents >= 0),
  quantity int not null check (quantity between 1 and 99)
);
create index order_items_order_idx on order_items(order_id);

-- Solo service_role (webhook de pasarela) puede cambiar el estado de pago
create function guard_payment_status() returns trigger
language plpgsql as $$
begin
  if new.payment_status is distinct from old.payment_status
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'El estado de pago solo lo actualiza la pasarela de pago';
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger orders_guard_payment before update on orders
  for each row execute function guard_payment_status();

-- ───────────── Atención y oportunidades ─────────────
create table support_requests (
  id uuid primary key default gen_random_uuid(),
  type request_type not null,
  status request_status not null default 'nuevo',
  customer_id uuid references auth.users(id) on delete set null,
  contact_name text not null,
  contact_email text not null,
  message text not null check (char_length(message) <= 4000),
  -- Contexto autorizado: producto, carrito u pedido desde donde se inició
  context jsonb not null default '{}',
  assistant_summary text,
  consent_at timestamptz not null,
  assigned_to uuid references auth.users(id),
  resolution text,
  escalation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_requests_status_idx on support_requests(status);

create table support_notes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references support_requests(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- ───────────── Auditoría y analítica ─────────────
create table audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  changes jsonb,
  created_at timestamptz not null default now()
);

create function audit_changes() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  row_id text := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id', to_jsonb(new) ->> 'slug');
  -- La auditoría registra cambios operativos, nunca datos personales
  pii text[] := array['shipping_address', 'contact_email', 'contact_name', 'message', 'full_name'];
begin
  insert into audit_log (actor_id, action, entity, entity_id, changes)
  values (
    auth.uid(), tg_op, tg_table_name, row_id,
    jsonb_build_object('antes', to_jsonb(old) - pii, 'despues', to_jsonb(new) - pii)
  );
  return coalesce(new, old);
end $$;

create trigger audit_products after insert or update or delete on products for each row execute function audit_changes();
create trigger audit_orders after insert or update on orders for each row execute function audit_changes();
create trigger audit_brand after update on brand_settings for each row execute function audit_changes();
create trigger audit_pages after insert or update or delete on content_pages for each row execute function audit_changes();
create trigger audit_faqs after insert or update or delete on faqs for each row execute function audit_changes();
create trigger audit_services after insert or update or delete on services for each row execute function audit_changes();
create trigger audit_requests after update on support_requests for each row execute function audit_changes();
create trigger audit_profiles after update on profiles for each row execute function audit_changes();

-- Eventos sin datos personales: solo nombre, ruta y metadatos no identificativos
create table analytics_events (
  id bigint generated always as identity primary key,
  name text not null,
  path text,
  props jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index analytics_events_name_idx on analytics_events(name, created_at);

-- ───────────── RLS ─────────────
alter table profiles enable row level security;
alter table brand_settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table services enable row level security;
alter table faqs enable row level security;
alter table content_pages enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table support_requests enable row level security;
alter table support_notes enable row level security;
alter table audit_log enable row level security;
alter table analytics_events enable row level security;

-- Perfiles: cada usuario ve y edita el suyo; admin ve todos
create policy profiles_own_select on profiles for select using (id = auth.uid() or has_role(array['admin']::staff_role[]));
create policy profiles_own_update on profiles for update using (id = auth.uid() or has_role(array['admin']::staff_role[]));

-- Configuración: lectura pública, edición solo admin
create policy brand_public_read on brand_settings for select using (true);
create policy brand_admin_write on brand_settings for update using (has_role(array['admin']::staff_role[]));

-- Catálogo: público ve solo lo activo; rol catálogo gestiona todo
create policy categories_public_read on categories for select using (active or has_role(array['catalogo']::staff_role[]));
create policy categories_staff_write on categories for all using (has_role(array['catalogo']::staff_role[])) with check (has_role(array['catalogo']::staff_role[]));
create policy products_public_read on products for select using (active or has_role(array['catalogo']::staff_role[]));
create policy products_staff_write on products for all using (has_role(array['catalogo']::staff_role[])) with check (has_role(array['catalogo']::staff_role[]));
create policy images_public_read on product_images for select using (
  exists (select 1 from products p where p.id = product_id and (p.active or has_role(array['catalogo']::staff_role[])))
);
create policy images_staff_write on product_images for all using (has_role(array['catalogo']::staff_role[])) with check (has_role(array['catalogo']::staff_role[]));

-- Contenido: público ve lo publicado; admin edita
create policy services_read on services for select using (published or has_role(array['admin']::staff_role[]));
create policy services_write on services for all using (has_role(array['admin']::staff_role[])) with check (has_role(array['admin']::staff_role[]));
create policy faqs_read on faqs for select using (published or has_role(array['atencion']::staff_role[]));
create policy faqs_write on faqs for all using (has_role(array['admin']::staff_role[])) with check (has_role(array['admin']::staff_role[]));
create policy pages_read on content_pages for select using (published or has_role(array['admin']::staff_role[]));
create policy pages_write on content_pages for all using (has_role(array['admin']::staff_role[])) with check (has_role(array['admin']::staff_role[]));

-- Pedidos: el cliente ve los suyos; rol pedidos gestiona. La creación va por service_role.
create policy orders_read on orders for select using (customer_id = auth.uid() or has_role(array['pedidos', 'atencion']::staff_role[]));
create policy orders_staff_update on orders for update using (has_role(array['pedidos']::staff_role[]));
create policy items_read on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or has_role(array['pedidos', 'atencion']::staff_role[])))
);

-- Atención: el cliente ve sus solicitudes; rol atención gestiona. La creación va por service_role.
create policy requests_read on support_requests for select using (customer_id = auth.uid() or has_role(array['atencion']::staff_role[]));
create policy requests_staff_update on support_requests for update using (has_role(array['atencion']::staff_role[]));
create policy notes_staff on support_notes for all using (has_role(array['atencion']::staff_role[])) with check (has_role(array['atencion']::staff_role[]) and author_id = auth.uid());

-- Auditoría y analítica: solo lectura para admin; escritura por triggers/service_role
create policy audit_admin_read on audit_log for select using (has_role(array['admin']::staff_role[]));
create policy analytics_admin_read on analytics_events for select using (has_role(array['admin']::staff_role[]));

-- Bucket público de imágenes de producto; solo el rol catálogo sube
insert into storage.buckets (id, name, public) values ('productos', 'productos', true) on conflict do nothing;
create policy productos_upload on storage.objects for insert with check (bucket_id = 'productos' and has_role(array['catalogo']::staff_role[]));
create policy productos_delete on storage.objects for delete using (bucket_id = 'productos' and has_role(array['catalogo']::staff_role[]));
