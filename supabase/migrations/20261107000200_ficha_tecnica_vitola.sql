-- Ficha técnica de la vitola. Todos los campos son opcionales: si la marca no los aporta, no se muestran.
alter table products
  add column brand text,
  add column vitola_galera text,
  add column ring_gauge smallint check (ring_gauge is null or ring_gauge between 20 and 80),
  add column length_mm smallint check (length_mm is null or length_mm between 50 and 300),
  add column strength smallint check (strength is null or strength between 1 and 5),
  add column tasting_notes text[] not null default '{}' check (cardinality(tasting_notes) <= 8);

create index products_brand_idx on products(brand);
