# Portfolio de Said Lucena

Sitio estático construido con Astro, Vue 3 y Tailwind 4. El contenido
editorial vive en Cloud Firestore y solo los archivos dinámicos de las
colecciones se sirven desde Cloudflare R2. Los archivos estáticos viven
únicamente en el proyecto.

## Arquitectura

- **Astro** posee rutas, layout, metadatos SEO, chrome y el contenido local
  (hero, cifras, about, servicios y habilidades). Las interacciones de esas
  secciones viven en scripts ligeros de `src/scripts/`, no en islas Vue.
- **Vue** renderiza el contenido administrado en Firestore durante el build.
  Artículos, índice del blog, stack, experiencia, educación, certificaciones y
  teaser del blog se sirven como HTML inicial sin hidratación. Solo se hidratan
  las superficies que necesitan estado: el índice de proyectos
  (`client:load`), los proyectos de la home (`client:visible`), contacto
  (`client:visible`) y las reseñas (`client:idle`).
- **Firestore** es la fuente de verdad del contenido editorial. El build falla
  si una colección está vacía o si el grafo editorial no valida, salvo
  `reviews`: puede estar vacía y la home muestra el estado vacío con el botón
  para dejar la primera reseña. El navegador no lee contenido público desde
  Firestore; solo el flujo de reseñas escribe y lee el documento propio del
  visitante autenticado con Google, y el formulario de contacto escribe en
  `forms` con esa misma sesión de Google.
- **Firebase Auth + Firestore Lite** se cargan de forma diferida. La sesión de
  Google es compartida: iniciarla o cerrarla en el formulario de contacto o en
  `/resenas/` afecta a ambos. Firestore Lite se carga al enviar el formulario
  de contacto y al abrir el panel de reseñas. Allí el visitante inicia sesión
  con Google, redacta, previsualiza y publica una reseña con `approved: false`.
- **Contacto** valida asunto y mensaje con Zod en el navegador y crea un
  documento en la colección privada `forms`. El nombre y el correo no son
  campos editables: salen de la cuenta de Google. Las reglas solo permiten esa
  escritura a una cuenta de Google verificada, ligada a su UID y correo; leer,
  actualizar o borrar mensajes queda reservado al Admin SDK y a la Consola.
- **Aprobación** fuera del alcance del panel: se hace desde Firestore/Consola
  poniendo `approved: true`. El siguiente build publica la reseña en la home,
  proyectos y experiencia. `firestore.rules` impide que el cliente se apruebe.
- **R2** entrega únicamente los archivos dinámicos referenciados por las
  colecciones: imágenes de proyectos, portadas y diagramas de artículos,
  archivos de blog y fotos de reviews. En Firestore se guardan rutas
  `/images/...` o `/files/...`; el build las resuelve con `PUBLIC_MEDIA_URL`.
- **Estáticos** (favicons, CV, imágenes decorativas, fuentes) viven en
  `src/assets` o en rutas públicas no reservadas. Nunca se suben a R2.

```text
src/
├── pages/                Rutas ES y EN
├── layouts/              Documento HTML, SEO y tema inicial
├── components/
│   ├── chrome/           Header, footer y controles persistentes (Astro)
│   ├── home/             Página y secciones de la home
│   ├── projects/         Índice, tarjetas y carrusel
│   ├── blog/             Índice, artículo y renderers editoriales
│   ├── reviews/          Acceso, panel, tarjeta e invitación de reseñas
│   ├── ui/               Primitivas compartidas (astro/ y vue/)
│   └── islands/          Entradas Vue que Astro importa (incluye reviews/)
├── data/
│   └── schemas/          Contratos Zod y validación del grafo
├── lib/
│   ├── firebase/         SDK web diferido (Auth + Firestore Lite)
│   ├── forms/            Repositorio y errores del formulario de contacto
│   ├── notifications/    Plantillas y cliente de avisos por EmailJS
│   ├── reviews/          Auth, repositorio, errores y composables
│   ├── server/           Firestore, fixtures y resolución de medios
│   └── withIslandContext.ts  Contexto por isla Vue
├── router/               Enlaces y estado de hash para Vue
├── scripts/              Mejoras progresivas para HTML Astro
└── stores/               Tema persistido entre islas
```

Cada feature separa `astro/` (render estático en build) y `vue/`
(implementación de islas). Las únicas entradas que un `.astro` puede importar
desde Vue viven en `components/islands/`; esa carpeta es una frontera de
importación, no una obligación de hidratar: también contiene entradas SSR-only.

Los avisos por correo se envían desde el navegador con EmailJS y se importan
dinámicamente al enviar. No hay servidor de notificaciones ni endpoint propio.

Las reglas de ingeniería están documentadas en [`docs/`](docs/README.md):
[arquitectura](docs/architecture.md), [convenciones](docs/conventions.md) y
[guía para añadir secciones](docs/guides/adding-a-section.md). El resumen local
de componentes vive en `src/components/README.md`.

## Desarrollo

```sh
npm install
cp .env.example .env
npm run dev
```

El servidor de desarrollo y el build leen Firestore, así que requieren las
credenciales descritas abajo o Application Default Credentials.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `SITE_URL` | Dominio canónico para canonical, hreflang, Open Graph y sitemap. Obligatorio: el build falla si no está definido. |
| `PUBLIC_MEDIA_URL` | Dominio público de R2 para archivos dinámicos. Debe usar HTTPS y es obligatorio en el build. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Credenciales server-only para el futuro CRUD de medios en R2. No se usan en el build estático. |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Credenciales de la cuenta de servicio para leer Firestore en build sin archivo JSON. Si no se definen, se usa Application Default Credentials. |
| `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_APP_ID` | Configuración web pública de Firebase para el login con Google y las escrituras de reseñas. No son secretos; se obtienen con `npx firebase-tools apps:sdkconfig web`. |
| `PUBLIC_EMAILJS_PUBLIC_KEY`, `PUBLIC_EMAILJS_SERVICE_ID`, `PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID`, `PUBLIC_EMAILJS_REVIEW_TEMPLATE_ID` | Avisos por correo de contacto y reseñas con EmailJS. Son identificadores **públicos de navegador**, no secretos: Astro los incluye en el JavaScript compilado y son visibles para cualquier visitante. La Private Key no se usa. Si falta un valor, esa notificación se omite. El destinatario se configura dentro de EmailJS. |
| `CONTENT_SOURCE=fixture` | Solo pruebas locales: genera el sitio con contenido de prueba sin Firestore. No desplegar ese build. |

`.env` y las claves de servicio están ignoradas por Git. Las reglas de Firestore
solo permiten al visitante autenticado con Google leer y escribir su propio
documento `reviews/{uid}`, y permiten crear un documento en `forms` únicamente
a una cuenta de Google verificada, con su UID y correo ligados al documento;
leer, actualizar o borrar mensajes desde el navegador está denegado. El Admin
SDK del build lee el contenido editorial y las reseñas aprobadas.

## Formulario de contacto

El formulario de la home vive en `src/components/home/vue/ContactSection.vue` y
se hidrata con `client:visible`. Para enviar, el visitante inicia sesión con
Google; el nombre y el correo se muestran en modo lectura desde su cuenta y no
son campos del formulario. La misma sesión se reutiliza en `/resenas/` y
viceversa, y cambiar de cuenta abre el selector de Google.

El asunto y el mensaje se validan con Zod en `src/data/contact.ts`; el envío
crea un documento en `forms` con `senderUid`, `name`, `email`, `subject`,
`message`, `locale` y `createdAt` de servidor. Firestore y el repositorio se
importan dinámicamente al enviar; la sesión de Auth se resuelve al hidratar la
isla.

Los límites (nombre 1–80, correo hasta 254, asunto 3–120 y mensaje 10–2000)
están repetidos en `firestore.rules` porque las reglas no pueden importar
TypeScript. Las reglas exigen `email_verified`, proveedor `google.com` y que
`senderUid` y `email` coincidan con el UID y el correo del token. Los mensajes
contienen datos personales: se leen en Firestore → `forms` o con el Admin SDK,
nunca desde el navegador. No hay un límite de tasa en las reglas; para
producción conviene habilitar App Check y alertas de uso.

## Reseñas de visitantes

Antes de probar el login, añade `localhost` y el dominio de producción a
**Firebase Authentication → Settings → Authorized domains**. El proveedor de
Google se configura con `firebase.json` y se despliega con
`npx firebase-tools deploy --only auth`. Publica la pantalla de consentimiento
de Google OAuth antes de abrir el flujo a visitantes externos.

1. El visitante entra a `/resenas/` y continúa con Google. La sesión es la misma
   que usa el formulario de contacto: si ya inició sesión allí, entra directo.
2. En `/resenas/panel/` escribe roles, vínculo opcional y reseña, y ve la vista
   previa con la misma tarjeta del home. La reseña admite 40–400 caracteres y
   hasta 3 roles. El idioma de la reseña se hereda del portfolio en ese momento;
   no hay selector visible. Firestore guarda solo la URL de la foto de Google;
   si la imagen no carga, la tarjeta usa iniciales. El correo se publica en la
   tarjeta como enlace `mailto:`. El límite de 10 MB se aplicará cuando exista
   una subida/proxy de la imagen.
3. Al publicar, se guarda `reviews/{uid}` con `approved: false`. Puede editar
   mientras siga pendiente.
4. Para aprobar, abre Firestore → `reviews`, revisa el documento y pon
   `approved: true` (opcionalmente `order` para fijar el orden).
5. Ejecuta el build/deploy habitual. La reseña aparecerá en el home y en los
   proyectos/experiencias vinculados.

Las reseñas antiguas sin `approved` quedan fuera del query y no se publican.
`firestore.rules` se despliega con:

```sh
npx firebase-tools deploy --only firestore:rules
```

Si el hosting envía `Cross-Origin-Opener-Policy`, usa
`same-origin-allow-popups` para no romper el popup de Google. Una CSP debe
permitir `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`,
`firestore.googleapis.com`, `northsideboy-portfolio.firebaseapp.com`,
`accounts.google.com` y `*.googleusercontent.com`.

## Avisos por correo (EmailJS)

Los dos formularios guardan primero en Firestore y después avisan por EmailJS
desde el navegador. No hay Cloud Functions, endpoint propio ni servidor de
notificaciones: el sitio sigue siendo estático.

- `src/lib/notifications/emailjs.ts` construye las variables de plantilla y
  llama a EmailJS. Se importa dinámicamente al enviar, así que ninguna página
  descarga EmailJS al cargarse.
- Contacto notifica tras crear el documento en `forms`; reseñas notifican solo
  al crear `reviews/{uid}`, nunca al editar ni al aprobar.
- Las plantillas reciben `name`, `email`, `subject`, `locale` y `message` en
  contacto, y `author_name`, `author_email`, `roles`, `locale`, `relations` y
  `quote` en reseñas. Las listas se envían como texto legible.
- El destinatario se fija en EmailJS, no en el navegador. Solo se usa la Public
  Key; la Private Key no se necesita y no debe exponerse nunca.
- Un fallo o una demora de EmailJS no repite la escritura ni cambia el estado
  de éxito: el mensaje o la reseña ya están guardados y siguen disponibles en
  Firestore. Por el mismo motivo, un documento puede quedar guardado sin aviso
  si el visitante cierra la pestaña justo después de enviar.

**Sobre la visibilidad:** las variables `PUBLIC_EMAILJS_*` aparecen en el
JavaScript compilado y en las peticiones del navegador. Eso es inevitable si el
envío se hace desde el cliente. No son secretos y no deben tratarse como tales;
nunca pongas la Private Key en una variable `PUBLIC_`. Si en el futuro necesitas
ocultar también estos identificadores, haría falta un proceso servidor.

Antes de desplegar, añade el dominio del sitio y `localhost` a los orígenes
permitidos de EmailJS. Si el hosting aplica CSP, debe permitir
`https://api.emailjs.com` en `connect-src`.

## Medios

- **Dinámico:** Firestore guarda rutas relativas `/images/...` o `/files/...`.
  El build les antepone `PUBLIC_MEDIA_URL`; no se guardan URLs absolutas.
- **Estático:** imágenes y fuentes en `src/assets`; descargas fijas en rutas
  públicas no reservadas como `/cv/`. Nunca se suben a R2.
- `public/images` y `public/files` están reservados a contenido dinámico y no
  deben existir en el repositorio. El build falla si aparecen.
- El cliente S3 mínimo vive en `src/lib/server/r2.ts`. No se usa en el build
  estático y queda listo para el futuro CRUD de medios.
- Cambiar de `r2.dev` a un dominio propio solo requiere actualizar
  `PUBLIC_MEDIA_URL`. Firestore y las keys de R2 no cambian.

## Verificación

```sh
npm run check
npm test
npm run test:browser
npm run build
```

El sitemap público se sirve desde `/sitemap-index.xml` y `/sitemap-0.xml`; se
genera en build con `lastmod` de los artículos y alternates de idioma.

`npm test` ejecuta las pruebas unitarias y de contratos. `npm run test:browser`
genera un build aislado con contenido de prueba (`CONTENT_SOURCE=fixture`) y
comprueba en Chromium los filtros, el tema entre islas, los enlaces ES/EN, los
fragmentos profundos, el teclado y el HTML servido sin JavaScript. Ese build de
prueba no debe desplegarse.

El build de producción recorre las diez colecciones, valida relaciones y genera
las rutas publicadas. Solo incluye reseñas con `approved == true`; los
artículos en borrador no se incluyen en el sitio ni en el sitemap. Los correos
de las reseñas se publican en la tarjeta junto al badge de Google.
