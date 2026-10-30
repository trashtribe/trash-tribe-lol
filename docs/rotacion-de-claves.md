# Rotación de claves

Guía para cambiar las claves secretas de la tienda. Ninguna clave se guarda en el repositorio, en Notion ni en chats: viven en Vercel (Settings → Environment Variables), en `.env.local` del ordenador y, como copia, en Proton Pass.

## Cuándo rotar

- **Una vez al año**, todas las de la tabla. Anotar la fecha abajo.
- **En el momento**, la clave afectada si:
  - se pegó en un sitio donde no debía (Notion, un chat, un commit, una captura);
  - alguien con acceso deja el proyecto;
  - el servicio avisa de una filtración o de actividad rara.

## Regla general

1. Crear la clave nueva **sin borrar la vieja**.
2. Ponerla en Vercel (Production; también Preview si ese entorno la usa) marcada como **Sensitive**, y en `.env.local`.
3. Volver a desplegar: Vercel → Deployments → último deploy → `···` → Redeploy. Las variables nuevas solo se aplican en un deploy nuevo.
4. Comprobar que la web funciona (abajo, "Después de rotar").
5. Revocar la clave vieja en el servicio.
6. Actualizar la copia en Proton Pass y la fecha en la tabla.

## Claves

| Variable | Dónde se crea la nueva | Qué se rompe si falla | Notas |
| --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → Roll key | El checkout no puede cobrar | Stripe deja elegir cuánto tiempo sigue viva la vieja: poner 1 hora. |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → el endpoint → Roll secret | Los pagos no se marcan como pagados ni se envían a Printify | Stripe también permite mantener el secreto viejo un rato. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys | Pedidos, newsletter, contacto | Si el proyecto usa las claves nuevas (`sb_secret_...`), crear una nueva y borrar la vieja. Con las claves antiguas (JWT), rotar el JWT secret cambia también la `anon` y **cierra la sesión de todos los clientes**: hacerlo solo si hubo filtración. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Igual que la anterior | Login, cuenta, favoritos | Es pública por diseño (va en el navegador). Solo se rota junto a la de arriba. |
| `PRINTIFY_API_KEY` | Printify → My profile → Connections → Generate | El catálogo desaparece y los pedidos no llegan | Al generar el token se elige fecha de caducidad: poner 1 año y apuntarla. |
| `PRINTIFY_WEBHOOK_SECRET` | Volviendo a registrar los webhooks (comando en `app/api/printify-webhook/route.ts`) | Los cambios de catálogo tardan 5 minutos en verse en vez de segundos | Borrar antes los webhooks viejos con la API de Printify. |
| `RESEND_API_KEY` | Resend → API Keys → Create | No llegan los emails de pedido ni el formulario de contacto | Permiso "Sending access" y solo el dominio trashtribe.lol. |
| `INTERNAL_ORDER_EMAIL_SECRET` | Inventada: `openssl rand -hex 32` | No llegan los emails de confirmación de pedido | No hay nada que revocar: basta con cambiarla en Vercel y redesplegar. |
| `PRODIGI_API_KEY` | Prodigi → Settings → API | Nada todavía (sin productos) | |
| Secrets de GitHub (`PRINTIFY_API_KEY`, `PRINTIFY_SHOP_ID`) | GitHub → repo → Settings → Secrets and variables → Actions | El CI no puede compilar | Actualizar cada vez que se rote `PRINTIFY_API_KEY`. |

`PRINTIFY_SHOP_ID` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` no son secretos. La publicable de Stripe cambia sola al pasar de test a live.

## Después de rotar

- Abrir la tienda y una ficha de producto (Printify).
- Iniciar sesión y abrir `/account` (Supabase).
- Llegar al checkout y ver el formulario de tarjeta (Stripe).
- Mandar un mensaje de prueba desde `/contact` (Resend).
- Si se tocó Stripe: Stripe → Webhooks → el endpoint → reenviar un evento reciente y comprobar que responde 200.
- Que el CI de GitHub siga en verde.

## Registro

| Fecha | Claves rotadas | Motivo |
| --- | --- | --- |
| | | |
