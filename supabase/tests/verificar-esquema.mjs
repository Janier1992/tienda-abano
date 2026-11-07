// Aplica las migraciones en PGlite (Postgres embebido) con stubs de auth/storage y prueba invariantes y RLS.
// Uso: node supabase/tests/verificar-esquema.mjs supabase/migrations
import { PGlite } from '@electric-sql/pglite'
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Acepta una carpeta (aplica todas las migraciones en orden) o un archivo
const target = process.argv[2]
const files = statSync(target).isDirectory() ? readdirSync(target).filter((f) => f.endsWith('.sql')).sort().map((f) => join(target, f)) : [target]
const migration = files.map((f) => readFileSync(f, 'utf8')).join('\n')
let failures = 0

async function freshDb() {
  const db = new PGlite({ extensions: { pg_trgm } })
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select nullif(current_setting('test.role', true), '') $$;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  `)
  await db.exec(migration)
  return db
}

const short = (e) => e.message.split('\n')[0]
async function expectFail(db, label, sql) {
  try { await db.exec(sql); console.log('FALLO (debía rechazarse):', label); failures++ }
  catch (e) { console.log('OK rechazado:', label, '→', short(e)) }
}
async function expectOk(db, label, sql) {
  try { await db.exec(sql); console.log('OK:', label) }
  catch (e) { console.log('FALLO:', label, '→', short(e)); failures++ }
}
async function expectCount(db, label, sql, expected) {
  const parts = sql.split('; ')
  const query = parts.pop()
  if (parts.length) await db.exec(parts.join('; ') + ';')
  const { rows } = await db.query(query)
  const ok = Number(rows[0].n) === expected
  console.log(ok ? 'OK:' : 'FALLO:', label, `(${rows[0].n}/${expected})`)
  if (!ok) failures++
}
const as = (uid, role = 'authenticated') => `select set_config('test.uid', '${uid}', false), set_config('test.role', '${role}', false);`
const ORDER = (email, customer = 'null') => `insert into orders (customer_id, contact_email, contact_name, shipping_address, region, subtotal_cents, currency) values (${customer}, '${email}', 'Cliente', '{"linea":"Calle 1"}', 'ES-MD', 1000, 'EUR') returning id`

// ── Escenario 1: restricciones de datos (operador) ──
{
  const db = await freshDb()
  console.log('OK migración aplicada\n— Restricciones —')
  await db.exec(`insert into auth.users (email) values ('c@x.test')`)
  await expectCount(db, 'perfil creado con rol cliente', `select count(*) n from profiles where role = 'cliente'`, 1)
  await expectFail(db, 'activar ventas sin validación legal', `update brand_settings set sales_enabled = true`)
  await expectOk(db, 'activar ventas con todos los requisitos', `update brand_settings set sales_enabled = true, legal_responsible = 'Asesoría', legal_validated_at = now(), age_verification_provider = 'x', payment_provider = 'y', allowed_regions = '{ES-MD}'`)
  await expectFail(db, 'publicar producto incompleto', `insert into products (slug, name, active) values ('incompleto', 'X', true)`)
  await expectFail(db, 'slug inválido', `insert into products (slug, name) values ('Mal Slug', 'X')`)
  await expectOk(db, 'crear borrador', `insert into products (slug, name) values ('borrador', 'Borrador')`)
  await expectOk(db, 'ficha técnica válida', `update products set brand = 'Marca', ring_gauge = 52, length_mm = 156, strength = 4, tasting_notes = '{cedro,cacao}' where slug = 'borrador'`)
  await expectFail(db, 'fortaleza fuera de escala', `update products set strength = 7 where slug = 'borrador'`)
  await expectFail(db, 'cepo imposible', `update products set ring_gauge = 300 where slug = 'borrador'`)
  const { rows: [o] } = await db.query(ORDER('c@x.test'))
  await expectFail(db, 'enviar sin pago confirmado', `update orders set status = 'enviado' where id = '${o.id}'`)
  await expectFail(db, 'operador sin rol de servicio marca pago', `update orders set payment_status = 'confirmado' where id = '${o.id}'`)
  await expectOk(db, 'pasarela (service_role) confirma pago', `${as('', 'service_role')} update orders set payment_status = 'confirmado' where id = '${o.id}'`)
  await expectOk(db, 'enviar con pago confirmado', `update orders set status = 'enviado' where id = '${o.id}'`)
  await expectFail(db, 'cantidad fuera de rango', `insert into order_items (order_id, product_name, unit_price_cents, quantity) values ('${o.id}', 'X', 100, 500)`)
  // Pedido atómico: una línea inválida revierte también el pedido
  const item = (q) => `{"product_name":"Caja","unit_price_cents":1000,"quantity":${q}}`
  const ord = '{"contact_name":"Cliente","contact_email":"c@x.test","shipping_address":{},"region":"ES-MD","subtotal_cents":2000,"currency":"EUR"}'
  await expectOk(db, 'create_order crea pedido y líneas', `select * from create_order('${ord}', '[${item(2)}]')`)
  await expectCount(db, 'create_order deja el pedido pendiente de pago', `select count(*) n from orders where status = 'pendiente_pago' and payment_status = 'pendiente'`, 1)
  await expectFail(db, 'create_order con línea inválida', `select * from create_order('${ord}', '[${item(1)}, ${item(500)}]')`)
  await expectCount(db, 'línea inválida no deja pedido huérfano', `select count(*) n from orders o where o.subtotal_cents = 2000 and not exists (select 1 from order_items i where i.order_id = o.id)`, 0)
  await expectFail(db, 'create_order sin artículos', `select * from create_order('${ord}', '[]')`)
  const { rows } = await db.query(`select changes::text t from audit_log where entity = 'orders'`)
  const leaked = rows.some((r) => /c@x\.test|Calle 1|Cliente/.test(r.t))
  console.log(leaked ? 'FALLO auditoría contiene datos personales' : 'OK auditoría sin datos personales'); if (leaked) failures++
}

// ── Escenario 2: peticiones vía API (session_user = authenticator, RLS activo) ──
{
  const db = await freshDb()
  console.log('\n— RLS y permisos vía API —')
  const { rows: [c] } = await db.query(`insert into auth.users (email) values ('c@x.test') returning id`)
  const { rows: [c2] } = await db.query(`insert into auth.users (email) values ('otro@x.test') returning id`)
  const { rows: [a] } = await db.query(`insert into auth.users (email) values ('admin@x.test') returning id`)
  await expectOk(db, 'operador designa al primer admin desde SQL', `update profiles set role = 'admin' where id = '${a.id}'`)
  const { rows: [o] } = await db.query(ORDER('c@x.test', `'${c.id}'`))
  await db.query(ORDER('otro@x.test', `'${c2.id}'`))
  await db.exec(`insert into products (slug, name) values ('borrador', 'Borrador')`)
  await db.exec(`create role authenticator; grant usage on schema public, auth to authenticator; grant all on all tables in schema public to authenticator; grant execute on all functions in schema public, auth to authenticator; set session authorization authenticator;`)

  await expectFail(db, 'cliente se asciende a admin', `${as(c.id)} update profiles set role = 'admin' where id = '${c.id}'`)
  await expectCount(db, 'cliente ve solo sus pedidos', `${as(c.id)} select count(*) n from orders`, 1)
  await expectCount(db, 'anónimo no ve pedidos', `${as('', 'anon')} select count(*) n from orders`, 0)
  await expectFail(db, 'anónimo crea pedido directamente', `${as('', 'anon')} ${ORDER('x@x.test')}`)
  await expectCount(db, 'anónimo no ve borradores de catálogo', `${as('', 'anon')} select count(*) n from products`, 0)
  await expectFail(db, 'anónimo crea producto', `${as('', 'anon')} insert into products (slug, name) values ('hack', 'Hack')`)
  await expectCount(db, 'cliente no puede activar ventas (0 filas)', `${as(c.id)} with u as (update brand_settings set tagline = 'x' returning 1) select count(*) n from u`, 0)
  await expectFail(db, 'admin marca pago confirmado', `${as(a.id)} update orders set payment_status = 'confirmado' where id = '${o.id}'`)
  await expectOk(db, 'admin cambia el rol de otro usuario', `${as(a.id)} update profiles set role = 'catalogo' where id = '${c2.id}'`)
  await expectCount(db, 'rol catálogo ve borradores', `${as(c2.id)} select count(*) n from products`, 1)
  await expectCount(db, 'rol catálogo no ve pedidos ajenos', `${as(c2.id)} select count(*) n from orders where customer_id <> '${c2.id}'`, 0)
  await expectCount(db, 'cliente no lee auditoría', `${as(c.id)} select count(*) n from audit_log`, 0)
}

console.log(failures === 0 ? '\nTODAS LAS VERIFICACIONES OK' : `\n${failures} FALLOS`)
process.exit(failures === 0 ? 0 : 1)
