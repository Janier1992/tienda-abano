# Información pendiente de la marca (spec §18)

Ordenada por prioridad. Lo marcado como **bloqueante** impide activar la función correspondiente; el resto puede cargarse desde el panel de administración sin tocar código.

## Bloqueantes para vender
1. **Revisión legal local**: jurisdicciones de operación, legalidad de la venta a distancia de tabaco, publicidad permitida, advertencias sanitarias obligatorias, edad mínima. → habilita `sales_enabled`.
2. **Regiones donde se pretende vender** (códigos, p. ej. `ES-MD`). → `allowed_regions`.
3. **Proveedor de verificación de edad** adecuado a la normativa. → `age_verification_provider` + integración.
4. **Pasarela de pago** que admita productos de tabaco en la jurisdicción. → `payment_provider` + webhook.
5. **Zonas, modalidades y costes de envío**, impuestos aplicables y transportista autorizado para tabaco.

## Necesarios para publicar el catálogo
6. Nombre oficial, descripción y propuesta de valor de la marca. → Configuración.
7. Logotipo, manual de marca y paleta (sustituye la dirección visual provisional en `src/app/globals.css`).
8. Catálogo verificado: nombres, descripciones, presentaciones, fotografías oficiales, precios y moneda.
9. Reglas de actualización de inventario y responsable.

## Necesarios para la atención
10. Canales, horarios reales y responsables de atención.
11. Preguntas frecuentes con respuestas oficiales.
12. Servicios que la marca ofrece realmente (asesoría, eventos, posventa…).
13. Políticas: privacidad, condiciones de compra, envíos, devoluciones/cancelaciones, reclamaciones, aviso legal (slugs sugeridos: `privacidad`, `condiciones`, `envios`, `devoluciones`, `aviso-legal`).
14. Personal y roles del panel (admin, catálogo, pedidos, atención).

## Contradicciones o dudas registradas
- La especificación pide mostrar impuestos y envío antes de confirmar; no hay fuente oficial aún → se muestran como "pendiente de cálculo" y el total no se presenta como definitivo.
