@AGENTS.md

# Contexto del proyecto trashtribe

Actualizado 2026-10-31. Es una foto del estado: verificar contra el código antes de dar algo por hecho.

## Convenciones

- Idioma: español neutro.
- Commits con mensaje real y descriptivo. `git push` sin `cd`.
- Código en Claude Code; Cowork queda para Notion, investigación y documentos.

## Decisiones

- Prodigi será un catálogo paralelo a Printify, no un reemplazo. Cliente en `lib/prodigi.ts`, variables en `.env.example`. La clave de sandbox está en `.env.local` (no se sube a git).
- El "Coming soon" se controla con el interruptor `COMING_SOON_ENABLED` en `proxy.ts` (hoy en `false`). Basta con cambiarlo a `true` y hacer push; no necesita clave. `PREVIEW_ACCESS_KEY` es opcional (salta la pantalla con `?key=`) y se borró de Vercel el 2026-10-31.
- Underwear oculta hasta nuevo aviso (2026-10-29, problemas con esa línea). Interruptor `HIDDEN_CATEGORIES` en `lib/categories.ts`: quitar `"UNDERWEAR"` y hacer push para reactivarla.
- Envío (2026-10-31): se cobra lo que cobra Printify por país y carrito (`lib/shipping.ts`): un paquete por proveedor, primer artículo + adicionales, USD→EUR a 0,90 y redondeo hacia arriba a .99. Sin envío gratis ni exprés (Printify no ofrece exprés para estos productos). Países en `lib/countries.ts`; se quitó "Other" (mandaba los pedidos a EE. UU.). El checkout pide el precio a `/api/shipping-quote` y `create-payment-intent` lo recalcula.
- `/shipping-returns`: sin precios de envío ni sección de pedidos defectuosos (lo cubre `/terms`). Devoluciones: escribir a soporte y se resuelve caso a caso (de momento se reembolsa sin pedir la prenda de vuelta; no se publica).
- Al reactivar Underwear, volver a añadir en `/shipping-returns` y `/terms` que la ropa interior desprecintada no se devuelve por higiene (se quitó al acortar los textos legales).
- Stripe sigue en modo test en producción a propósito hasta el lanzamiento. Los pagos test nunca se mandan a Printify (`app/api/webhook/route.ts`), salvo con `PRINTIFY_ALLOW_TEST_ORDERS=true`.
- Seguridad: el checkout recalcula precios desde el catálogo; RLS de `orders`/`order_items` solo lectura (migración 015); límite de envíos por IP en contacto y newsletter (`lib/rate-limit.ts`, migración 016); cabeceras en `next.config.ts`.
- Accesos revisados (2026-10-31): solo una persona en Stripe, Supabase, Vercel y GitHub; en Printify además la diseñadora.
- Compra de prueba completa hecha en modo test (2026-10-31). Falta probar un cobro real con Stripe en live.
- Textos legales cortos y sin nombrar proveedores (preferencia expresa del equipo). Solo la línea de identidad de deeptribe OÜ (`LEGAL_ENTITY` en `lib/site.ts`) es obligatoria. Devoluciones por soporte (email o Discord), sin dirección publicada.
- Tests: Playwright en `e2e/` (`npm run build` y luego `npm run test:e2e`), también en el CI. Nunca crean pedidos: el checkout se prueba hasta el control de precio del servidor.
- Rotación de claves: guía en `docs/rotacion-de-claves.md`, con registro de fechas.
- Errores: Sentry (región UE), solo producción, solo errores, sin datos personales (`dataCollection` todo desactivado en `lib/sentry.ts`). Mencionado de forma genérica en `/privacy`.
- Uptime: UptimeRobot (avisa en Discord #uptime-alerts) más cron diario a `/api/health`.
- Analíticas: Vercel Web Analytics sin cookies (plan Hobby), sin banner de cookies.
- Migraciones: Supabase CLI enlazado al proyecto `dzqeaxvekkcrdbcfisgc` (2026-10-31); 001–016 marcadas como aplicadas. Nuevas migraciones: crear el archivo en `supabase/migrations/` y `supabase db push --linked` (probar antes con `--dry-run`). Las políticas reales de la base pueden tener nombres distintos a los del repo; comprobar con `pg_policies`.
- Descripciones de producto (Printify): tono corto con humor seco, ficha técnica real (modelo, fit, nº de tallas y colores activos) y cierre en español. Evitar frases cursis. Verificar cifras contra las variantes activas antes de escribirlas.
- El proyecto vive en `~/Developer/trash-tribe-lol` (fuera de iCloud desde 2026-10-30). En `~/Documents`, iCloud creaba copias `… 2.ts` en `.next` que rompían `tsc`.
- Imágenes: servir solo WebP y montar la imagen de hover solo al pasar el cursor, para no agotar las transformaciones de Vercel Image Optimization (alerta del 75% de 5.000).

## Pendiente

Antes de cobrar de verdad:
- Pasar Stripe a live: activar la cuenta, claves reales en Vercel como Sensitive y solo en Production, webhook live y su secreto.
- Compra real pequeña y reembolso.

Seguridad:
- Vercel: app de autenticación de respaldo.

Producto:
- Etiqueta de cuello en 3 camisetas; revisión de diseño con la diseñadora.
- Leer y corregir todos los textos de la web, sección por sección: inicio, shop, fichas y descripciones de producto, about, contacto, legales, emails.
- Sapphic Code Baby Tee: Printify ya no reconoce su combinación de modelo (2053) y proveedor (29); revisarlo antes de que alguien lo compre.
- Proveedores (foco UE + Reino Unido, 2026-11-01): Printful (como taller dentro de Printify) envía una camiseta por ~$5 a la UE/UK frente a $11–13 de los talleres actuales; falta ver su coste de fabricación y probar con "Love is... Tee" (no hace falta tocar código). Concentrar el catálogo en pocos talleres europeos para que los pedidos lleguen en un solo paquete.
- Tapstitch (futuro): prendas más de diseño que encajan con TT, pero fabrican en China y Los Ángeles (Special Line ~10 días a Europa) y no tienen API para tiendas propias. Plan si se retoma: pedir muestras a una dirección europea (calidad, plazo, aduanas) y luego montar una tienda Shopify oculta como puente (nuestro webhook crea el pedido pagado allí y Tapstitch lo recoge); Stripe se queda. Antes, aclarar IVA de importación UE/UK con Tapstitch y la gestoría.
- Prodigi: probar la API, decidir productos, catálogo local ligado a `getProducts()` y envío del pedido tras el pago.

Técnico:
- Autocompletar dirección en el checkout: los campos ya tienen `autoComplete` completo para el autorrelleno del navegador; uno de verdad enviaría lo escrito a un servicio externo (decisión pendiente).
- Sentry, opcional: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` y `SENTRY_PROJECT` en Vercel para que los errores del navegador muestren el código legible.
- Node 22 en el Mac local (el proyecto ya pide 22.x; la máquina tiene 20.9).
