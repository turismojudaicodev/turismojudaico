# ToDo

Última revisión: noviembre 2026 (branch `pruebas-lucas`).

Estado general: el sitio público y el panel de contenidos ya estaban hechos. El trabajo actual es el **pipeline de reservas**:

1. Consulta
2. Seguridad
3. Cobro
4. Voucher

Hoy está en el paso de **cobro**: el mail se arma, pero no hay link de pago real.

---

## Correcciones del 23/11/2026

Se arreglaron los bugs del flujo de reservas (prioridad 2) y parte de la prioridad 1. Prueba automática: 50 de 50 casos del flujo pasan, más una prueba en navegador del formulario y del panel.

**Antes de usarlo en producción:**
- [ ] Entrar una vez a `/api/admin/setup-db`: crea las columnas nuevas (extras, `gmail_draft_id`) y amplía los estados. Se puede correr varias veces sin problema.
- [ ] Cargar `contact_security_email` en `destinations_config` para cada destino, o definir `SECURITY_FALLBACK_EMAIL` (si no, el mail al guía va a `GMAIL_USER`).
- [ ] Verificar que `NEXT_PUBLIC_BASE_URL` apunte al dominio real (se usa en los links del formulario y de aprobación).

Sigue pendiente la autenticación de la API y el login (prioridad 1).

## Resultado de las pruebas (5/11/2026, repetidas el 23/11/2026 con el mismo resultado)

Prueba local con `next build` + `next start`, MariaDB local y la API de Gmail simulada (los mails se guardaban en un archivo en vez de enviarse). Sin `.env` real ni las tablas viejas (`paquetes`, etc.), así que no se probó el contenido del sitio público.

| Qué se probó | Resultado |
|---|---|
| `npm ci` + `next build` | ✅ Compila sin errores |
| `next lint` | ✅ Sin errores (solo warnings de `<img>` y dependencias de `useEffect`) |
| Páginas públicas (`/`, `/tours`, `/contact`, `/blogs`, etc.) | ✅ Responden 200 |
| `/sitemap.xml` | ❌ Si falla la consulta a la base, **tira abajo todo el servidor** (`lib/sitemap.js` usa `res`, que no existe). En Vercel solo falla ese pedido |
| Reserva **sin** mensaje | ✅ Se guarda y manda 2 mails al cliente |
| Reserva **con** mensaje (base creada con `setup-db.js`) | ❌ 500: no existe la columna `gmail_draft_id`. El cliente igual recibe el mail y la reserva queda guardada |
| Reserva sin fecha | ⚠️ Se guarda con la fecha de hoy sin avisar |
| Nombre con HTML (`<a href=...>`) | ❌ Se guarda y se inserta tal cual en los mails |
| Algún mail al cliente con link a `/security/<uuid>` | ❌ Ninguno lo tiene |
| `/security/<uuid>` | ✅ Muestra la ciudad correcta |
| `/security/1` (id numérico) | ❌ También funciona, así que se pueden recorrer reservas ajenas |
| `/security/<uuid-inexistente>` | ❌ Muestra el formulario igual ("Unknown") |
| Envío del formulario de seguridad | ✅ Guarda los datos, genera el PDF y lo manda al guía |
| Checkboxes del formulario (AMIA, dificultad para caminar, conoce a alguien) | ❌ Marcados, se guardan en **0** (formidable v3 devuelve arrays) |
| Pasaporte subido en PDF | ❌ No aparece en el PDF del guía (solo se agregan imágenes) |
| Reenvío del formulario | ❌ Duplica filas en `booking_security_details` y vuelve el estado a `SECURITY_DOCS_RECEIVED`, aunque ya esté en cobro |
| Formulario con uuid inexistente | ❌ Responde 200 y le manda mail al guía igual |
| Archivos temporales de formidable | ❌ Quedan en `/tmp` y no se borran |
| Link "Approve" del mail del guía | ✅ Cambia el estado. ❌ Sin token: cualquiera con el link (o un antivirus de mail) lo activa, y con un uuid inventado también responde "Approved" |
| Botón "💳 Armar Cobro" (`handleNextStage`) | ❌ 404: manda `id` y el endpoint espera `uuid` |
| Botones "Borrador Pago" / "Enviar Directo" | ✅ Mandan el mail con el total. ❌ Link de pago = `LINK_DE_PAYPAL_O_STRIPE_AQUI`. ❌ `total_price_usd` queda en 0 |
| Botón "✅ Pasar a Seguridad" (PUT `/api/admin/booking`) | ❌ 500 en MySQL estricto (`WHERE id = ? OR booking_uuid = ?` compara texto con número). **El borrador de Gmail se manda igual antes del error** |
| Modal "Editar" → Guardar | ❌ Mismo 500 que el anterior |
| Voucher | ✅ Crea el borrador y pasa a `CONFIRMED_ASSIGNED`. ⚠️ Con datos "[MOCKUP]" / "[COMPLETAR]" |
| Mail de rechazo | ✅ Se manda. ❌ La reserva no pasa a `CANCELLED` |
| `GET /api/bookings` sin login | ❌ Devuelve todas las reservas con email y teléfono |
| `DELETE /api/admin/booking` sin login | ❌ Borra la reserva |
| `/api/admin/setup-db`, `/api/admin/check-schema`, `/admin/db-viewer` sin login | ❌ Accesibles |
| Cookie falsa `user={"role":"admin"}` | ❌ Entra al dashboard |
| Cookie `user` mal formada | ❌ El middleware tira 500 |
| Login de admin | ⚠️ Funciona, pero guarda la contraseña en texto plano dentro de la cookie |

Precios calculados con `lib/pricing.js`:

| Caso | Resultado |
|---|---|
| Buenos Aires 4 hs, 2 pax | ✅ $310 (+$40 con AMIA, aunque hoy AMIA nunca llega marcado) |
| Santiago half day, 2 pax | ✅ $310 (sin el extra de puerto: nunca llega) |
| Lima half day, 2 pax | ✅ $270 (sin Callao: nunca llega) |
| Río de Janeiro | ❌ **$0**: el nombre en `pricing.js` tiene espacios de más (`'Tour Judaico Rio de Janeiro  '`) |
| Ciudad u opción de tour no reconocida | ❌ **$0**, y el mail sale igual diciendo "Total to Pay: $0 USD" |
| Bogotá | ⚠️ 5 pax = $500, 12 pax = $570 fijo. Verificar si es el precio correcto |

---

## 🔴 Prioridad 1: Seguridad (urgente si está en producción)

- [ ] Proteger **todas** las rutas `/api/admin/*`, `/api/bookings` y las de escritura de `/api/content/*` y `/api/newsletter/*` (hoy el middleware solo cubre las páginas `/admin/...`)
- [ ] Rehacer el login de admin:
  - [ ] no guardar la contraseña en la cookie;
  - [ ] usar una sesión firmada (JWT o iron-session) en una cookie `httpOnly`;
  - [ ] comparar con bcrypt (ya está instalado) en vez de texto plano.
- [ ] Middleware: validar una sesión firmada, no solo `role` (el try/catch de `JSON.parse` ya está)
- [ ] Proteger `/api/admin/setup-db` y `/api/admin/check-schema` (`db-viewer` ya se movió a `/admin/dashboard/db-viewer`, detrás del login)
- [ ] Links de aprobar/rechazar del guía:
  - [ ] agregarles un token secreto (la columna `security_token` ya existe);
  - [x] pasar a una página con botón de confirmación (POST), para que los antivirus de mail no los activen solos;
  - [x] validar que la reserva exista y esté en `SECURITY_DOCS_RECEIVED`.
- [x] `/security/[uuid]`:
  - [x] buscar solo por `booking_uuid`, no por `id`;
  - [x] mostrar 404 si no existe;
  - [x] no mostrar el formulario si la reserva ya pasó esa etapa.
- [x] `/api/security/submit`: validar que el uuid exista y que el estado lo permita antes de guardar o mandar mails
- [x] Escapar el HTML de todo lo que escribe el cliente antes de meterlo en mails, y validar el email (evitar saltos de línea en el header `To:`)
- [ ] Agregar captcha o límite de envíos al formulario de reserva (hoy cualquiera puede usar el Gmail de la empresa para mandar mails a terceros)
- [ ] Datos de pasaportes:
  - [x] borrar los temporales de formidable después de generar el PDF;
  - [ ] definir cuánto tiempo se guardan esos datos.

## 🟠 Prioridad 2: Bugs que rompen el flujo

- [x] `api/security/submit.js`: leer los checkboxes con `getString()` (formidable v3 devuelve arrays). Hoy todos se guardan en 0
- [x] Unificar los nombres de los extras entre las tres partes. Hoy no coinciden:
  - [x] el formulario manda `extra_port_transfer`, `extra_casapueblo`, `extra_callao_port`, `extra_kosher_food`;
  - [x] `submit.js` solo guarda `extra_amia` y `extra_airport`;
  - [x] `pricing.js` lee `extra_port`, `extra_casapueblo`, `extra_callao`.
- [x] Agregar las columnas que faltan en `booking_security_details` para esos extras
- [x] `pricing.js`:
  - [x] corregir el nombre de Río (`'Tour Judaico Rio de Janeiro  '`);
  - [x] si `finalTotal === 0`, no mandar el mail y avisar en el panel.
- [x] `api/admin/booking.js` (PUT y DELETE):
  - [x] no usar `WHERE id = ? OR booking_uuid = ?`, sino uno u otro según el tipo;
  - [x] mandar el borrador de Gmail **después** de que el UPDATE salga bien.
- [x] `DashboardTableBookings` → `handleNextStage`:
  - [x] el paso "Armar Cobro" tiene que mandar `uuid` (y `mode`);
  - [x] revisar `res.ok` antes de actualizar la tabla, en todos los pasos.
- [x] Formulario de seguridad: impedir el doble envío
  - [x] `UNIQUE(booking_uuid)` + `ON DUPLICATE KEY UPDATE`;
  - [x] o bloquear el formulario después de enviarlo, con pantalla de "gracias".
- [x] PDF de seguridad:
  - [x] incluir los pasaportes subidos en PDF (adjuntarlos aparte o unirlos);
  - [x] rechazar o convertir HEIC (pdfkit solo acepta JPG y PNG). → los archivos que no son JPG/PNG se adjuntan aparte
- [x] Rechazo: `send-rejection` tiene que pasar la reserva a `CANCELLED`
- [x] Modal de edición:
  - [x] agregar los estados `SECURITY_DOCS_RECEIVED`, `SECURITY_APPROVED`, `SECURITY_REJECTED` y `CANCELLED`;
  - [ ] usar un select de destinos existentes (hay una foreign key a `destinations_config`). (por ahora devuelve un error claro)
- [x] Gmail:
  - [x] agregar la "Ref" a **todos** los mails, no solo a los borradores, para que "Ver Historial" encuentre el hilo;
  - [x] guardar el `draft.id` real (hoy se guarda el message id con el nombre `gmail_draft_id`) y usarlo directo, en vez de recorrer los últimos 20 borradores.
- [x] `reservation.js`: hacer obligatoria la fecha (hoy, si no viene, pone la de hoy)
- [x] `lib/sitemap.js`: usar `reject(err)` en vez de `res.status(...)` (hoy, si falla la base, `/sitemap.xml` tira abajo todo el servidor Node)

## 🟡 Prioridad 3: Lo que falta construir

- [x] **Mandar al cliente el link a `/security/<uuid>`** en el mail de "Pasar a Seguridad" (hoy no se manda en ningún lado)
- [ ] **Pagos con Stripe** (ya está instalado):
  - [ ] crear la sesión de Checkout con el total;
  - [ ] poner el link real en el mail de cobro;
  - [ ] webhook `checkout.session.completed` que pase la reserva a confirmada y guarde `deposit_paid_usd`;
  - [ ] definir si se cobra seña o el total.
- [x] Guardar `total_price_usd` al calcular el precio (hoy la parte de finanzas queda en 0)
- [x] Guía por destino: el mail va a `destinations_config.contact_security_email`; si no está cargado, a `SECURITY_FALLBACK_EMAIL` o `GMAIL_USER`
- [ ] ABM de guías y de destinos en el panel (las tablas existen pero no hay pantallas)
- [ ] Mails definitivos: reemplazar los textos "[MOCKUP]" de `reservation.js` (BA, Panamá, Lima, default) y del voucher
- [ ] Voucher: cargar guía, punto de encuentro y saldo desde el panel en vez de completarlos a mano en el borrador
- [x] Actualizar `setup-db.js` para que coincida con la base real:
  - [x] tabla `booking_security_details`;
  - [x] columna `gmail_draft_id`;
  - [x] estados `SECURITY_DOCS_RECEIVED` y `SECURITY_REJECTED` en el ENUM;
  - [x] semillas con los nombres de destino que usa el sitio ("Santiago de Chile", no "Santiago").
- [ ] Ver si conviene seguir en Vercel para subir pasaportes: el límite por request es ~4.5 MB. Opción: subirlos directo a Cloudinary o S3 desde el navegador
- [ ] Mostrar en el panel el total calculado y los datos de seguridad de cada reserva

### Pendientes viejos

- [ ] Suscripción a newsletter (sin verificar)
- [x] Envío de mail desde la página de contacto
- [x] Reserva de tours
- [ ] Audioguías: descarga de archivos

## 🔵 Prioridad 4: Concepto y prolijidad

- [ ] Que el flujo no dependa de si el cliente escribió un mensaje: hoy con mensaje va a "Por responder" y sin mensaje salta directo a Seguridad. Debería depender de la política del destino (`security_policy_type`)
- [ ] Respetar `EXTERNAL_FORM` (Panamá) y `NONE` (sin control de seguridad): no mostrar el formulario interno en esos casos
- [x] Mail de cobro: no decir "approved by the local community" en destinos sin control de seguridad (por ejemplo, Buenos Aires no pide pasaporte)
- [ ] Pasar las tarifas de `pricing.js` a una tabla en la base (destino + opción + rango de pax), en vez de buscar texto con `includes('4 hrs')`
- [ ] Cobrar según la cantidad real de pasajeros del formulario de seguridad, no según `pax_adults` de la consulta
- [ ] Revisar los precios dudosos: Bogotá (5 pax y 6+ fijo), Callao (el formulario dice +40/60, se cobra 60 fijo), Panamá "afternoon" con 1 pax
- [x] Unificar `/api/bookings` y `GET /api/admin/booking` (hacen lo mismo)
- [ ] Usar `db.promise()` en todos lados (ya está el helper `query()` en `lib/mysql.js`; falta migrar los endpoints de contenido viejos)
- [x] Sacar los `console.log` de debug ("PASO 1…8", etc.)
- [ ] Dejar una sola librería de Excel (`xlsx` o `exceljs`)
- [ ] Agregar un `.env.example` con las variables necesarias:
  - `DB_*`
  - `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_USER`
  - `NEXT_PUBLIC_BASE_URL`
  - Stripe
- [ ] Actualizar Next (13.1.2 es de 2023)
