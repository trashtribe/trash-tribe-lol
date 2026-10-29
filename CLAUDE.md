@AGENTS.md

# Contexto del proyecto trashtribe

Resumen traído de Cowork (actualizado 2026-10-29). Es una foto del estado: verificar contra el código antes de dar algo por hecho.

## Convenciones

- Idioma: español neutro.
- Commits con mensaje real y descriptivo. `git push` sin `cd`.
- Código en Claude Code; Cowork queda para Notion, investigación y documentos.

## Decisiones

- Prodigi será un catálogo paralelo a Printify, no un reemplazo. Cliente en `lib/prodigi.ts`, variables en `.env.example`. La clave de sandbox está en `.env.local` (no se sube a git).
- El "Coming soon" se controla con el interruptor `COMING_SOON_ENABLED` en `proxy.ts` (hoy en `false`). `PREVIEW_ACCESS_KEY` en Vercel se deja, es inofensiva.
- Underwear oculta hasta nuevo aviso (2026-10-29, problemas con esa línea). Interruptor `HIDDEN_CATEGORIES` en `lib/categories.ts`: quitar `"UNDERWEAR"` y hacer push para reactivarla.
- Imágenes: servir solo WebP y montar la imagen de hover solo al pasar el cursor, para no agotar las transformaciones de Vercel Image Optimization (alerta del 75% de 5.000).

## Pendiente

Inmediato:
- Confirmar el `git push` de `1f1ac8d` y comprobar que el sitio abre (no verificado).

Prodigi:
- Probar la API de verdad (la conexión no se ha probado).
- Decidir qué productos vender. El catálogo UK cubre calcetines, totes, pines/dijes, ropa infantil y tank tops; no se vio bolsa de maquillaje ni ropa interior.
- Crear el catálogo local, ligarlo a `getProducts()`, añadir columnas en la base de datos y enviar el pedido a Prodigi tras el pago.

Tablero de Notion (Tech & Dev):
- Vencidas: SEO básico (10 sep) y QA completo de la tienda con compra de prueba (20 sep).
- Revisión de diseño con la diseñadora.
- Arreglar la etiqueta de cuello en 3 camisetas.
- Auditoría de etiquetas y proveedores; campo de estado/región para US/CA/AU; auditoría de seguridad; CTAs de registro.
- DevOps: migraciones con Supabase CLI (prioridad alta), CI con lint y build, tests Playwright, Sentry, rate limiting, rotación de secretos y alertas de uptime.
- Revisar `created_at` en `email_signups`.
- Conector de GitHub, bloqueado.

Otros:
- Vigilar el uso de imágenes en Vercel; opcionalmente paginar `/shop`.
- Notion aún no refleja Prodigi ni el interruptor del coming soon.
- Ordenar archivos sin seguimiento en la raíz (imágenes `.png`, `about-us-hero.webp`, `hero-join-the-tribe.webp`, `cart-empty.svg`).
