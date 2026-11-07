-- DATOS DE DEMOSTRACIÓN — solo para revisar la interfaz. NO son datos de la marca ni deben publicarse.
-- Todo va marcado como "DEMO". Se puede ejecutar varias veces (borra y recrea los registros demo).
-- Para eliminarlos: ejecutar solo el bloque "Limpieza".

-- ───── Limpieza ─────
delete from products where slug like 'demo-%';
delete from categories where slug like 'demo-%';
delete from faqs where question like '[DEMO]%';
delete from services where name like '[DEMO]%';
delete from content_pages where slug in ('privacidad', 'condiciones', 'envios', 'devoluciones') and title like '[DEMO]%';

-- ───── Marca (la venta sigue deshabilitada: así se ve el control legal) ─────
update brand_settings set
  brand_name = 'Casa Demo',
  tagline = '[DEMO] Texto de ejemplo para la propuesta de valor. Pendiente del contenido oficial de la marca.',
  description = '[DEMO] Descripción institucional provisional para revisar el diseño.',
  currency = 'EUR',
  support_hours = '[DEMO] Lunes a viernes, 10:00–18:00',
  support_email = 'demo@ejemplo.invalid',
  sales_enabled = false
where id = 1;

-- ───── Catálogo ─────
insert into categories (slug, name, position) values
  ('demo-cajas', '[DEMO] Cajas', 1),
  ('demo-estuches', '[DEMO] Estuches', 2),
  ('demo-tubos', '[DEMO] Tubos', 3);

with c as (select id, slug from categories where slug like 'demo-%')
insert into products (slug, name, category_id, description, presentation, price_cents, stock_status, compliance_notice, active)
values
  ('demo-robusto-caja', '[DEMO] Robusto · caja', (select id from c where slug = 'demo-cajas'),
   'Ficha de demostración. La descripción verificada la aportará la marca.', 'Caja de 25 unidades', 25000, 'disponible',
   'Producto de tabaco. Venta exclusiva a mayores de edad.', true),
  ('demo-corona-estuche', '[DEMO] Corona · estuche', (select id from c where slug = 'demo-estuches'),
   'Ficha de demostración con disponibilidad a consultar.', 'Estuche de 5 unidades', 6500, 'consultar',
   'Producto de tabaco. Venta exclusiva a mayores de edad.', true),
  ('demo-churchill-tubo', '[DEMO] Churchill · tubo', (select id from c where slug = 'demo-tubos'),
   'Ficha de demostración sin disponibilidad para ver ese estado.', 'Tubo individual', 1800, 'agotado',
   'Producto de tabaco. Venta exclusiva a mayores de edad.', true),
  ('demo-borrador', '[DEMO] Borrador incompleto', (select id from c where slug = 'demo-cajas'),
   null, null, null, 'pendiente', null, false);

insert into product_images (product_id, url, alt, position)
select p.id, img.url, img.alt, 0
from products p
join (values
  ('demo-robusto-caja', '/demo/caja-madera.svg', 'Ilustración de demostración de una caja de madera'),
  ('demo-corona-estuche', '/demo/estuche.svg', 'Ilustración de demostración de un estuche'),
  ('demo-churchill-tubo', '/demo/tubo.svg', 'Ilustración de demostración de un tubo')
) as img(slug, url, alt) on img.slug = p.slug;

-- ───── Contenido ─────
insert into faqs (question, answer, position, published, responsible) values
  ('[DEMO] ¿Puedo comprar online?', '[DEMO] La compra online se activará cuando la marca complete la validación legal. Mientras tanto puedes dejar tu solicitud a un asesor.', 1, true, 'Equipo demo'),
  ('[DEMO] ¿Cómo contacto con una persona?', '[DEMO] Desde el formulario de contacto o pidiéndoselo al asistente virtual.', 2, true, 'Equipo demo');

insert into services (name, description, conditions, availability, published, responsible) values
  ('[DEMO] Asesoría personalizada', '[DEMO] Servicio de ejemplo para revisar la sección. La marca confirmará qué servicios ofrece realmente.', '[DEMO] Condiciones pendientes.', '[DEMO] Disponibilidad pendiente.', true, 'Equipo demo');

insert into content_pages (slug, title, body, published, responsible) values
  ('privacidad', '[DEMO] Política de privacidad', '[DEMO] Texto provisional. La política oficial debe redactarla y revisarla la marca con asesoría legal.', true, 'Equipo demo'),
  ('condiciones', '[DEMO] Condiciones de compra', '[DEMO] Texto provisional pendiente de revisión legal.', true, 'Equipo demo')
on conflict (slug) do nothing;
