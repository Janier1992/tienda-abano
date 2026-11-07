-- Crea pedido y líneas en una sola transacción: no pueden quedar pedidos sin artículos.
-- Solo la invoca el servidor con service_role, después de recalcular precios y validar el control de venta.
create function create_order(p_order jsonb, p_items jsonb)
returns table (id uuid, reference text)
language plpgsql security invoker set search_path = public as $$
declare
  new_order orders%rowtype;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Un pedido necesita al menos un artículo';
  end if;

  insert into orders (customer_id, contact_name, contact_email, shipping_address, region, status, payment_status, subtotal_cents, currency)
  values (
    nullif(p_order ->> 'customer_id', '')::uuid,
    p_order ->> 'contact_name',
    p_order ->> 'contact_email',
    p_order -> 'shipping_address',
    p_order ->> 'region',
    'pendiente_pago',
    'pendiente',
    (p_order ->> 'subtotal_cents')::int,
    p_order ->> 'currency'
  )
  returning * into new_order;

  insert into order_items (order_id, product_id, product_name, unit_price_cents, quantity)
  select new_order.id, (item ->> 'product_id')::uuid, item ->> 'product_name',
         (item ->> 'unit_price_cents')::int, (item ->> 'quantity')::int
  from jsonb_array_elements(p_items) as item;

  return query select new_order.id, new_order.reference;
end $$;

revoke execute on function create_order(jsonb, jsonb) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function create_order(jsonb, jsonb) to service_role;
  end if;
end $$;
