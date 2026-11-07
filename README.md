# Portfolio de Said Lucena

Sitio estático construido con Astro, islas de Vue 3 y Tailwind 4. El contenido
editorial vive en Cloud Firestore y solo los archivos dinámicos de las
colecciones se sirven desde Cloudflare R2. Los archivos estáticos viven
únicamente en el proyecto.

## Arquitectura

- **Astro** genera el HTML de inicio, proyectos, blog y artículos durante el
  build. El contenido editorial y las secciones estables son componentes
  `.astro`; no envían JavaScript de framework al navegador.
- **Vue** hidrata solo las islas que necesitan estado o interacción: encabezado,
  tema/idioma, filtros de proyectos, progreso e índice del artículo, controles
  de contacto y pie con contenido pasado por slot.
- **Firestore** es la fuente de verdad del contenido. El build falla si una
  colección está vacía o si el grafo editorial no valida.
- **R2** entrega únicamente los archivos dinámicos referenciados por las
  colecciones: imágenes de proyectos, portadas y diagramas de artículos,
  archivos de blog y fotos de reviews. En Firestore se guardan rutas
  `/images/...` o `/files/...`; el build las resuelve con `PUBLIC_MEDIA_URL`.
- **Estáticos** (favicons, CV, imágenes decorativas, fuentes) viven en
  `src/assets` o en rutas públicas no reservadas. Nunca se suben a R2.

```text
src/
├── pages/                Rutas ES y EN
├── layouts/              Documento HTML y tema inicial
├── components/
│   ├── islands/          Entradas Vue independientes
│   ├── article/          Renderizadores Astro de bloques editoriales
│   └── ui/               Componentes compartidos
├── data/
│   └── schemas/          Contratos Zod y validación del grafo
├── lib/server/           Firestore y resolución de medios
├── router/               Compatibilidad de enlaces para Vue
└── stores/               Tema compartido entre islas con Nano Stores
```

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
| `SITE_URL` | Dominio canónico y sitemap. |
| `PUBLIC_MEDIA_URL` | Dominio público de R2 para archivos dinámicos. Debe usar HTTPS y es obligatorio en el build. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Credenciales server-only para el futuro CRUD de medios en R2. No se usan en el build estático. |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Credenciales de la cuenta de servicio para leer Firestore en build sin archivo JSON. Si no se definen, se usa Application Default Credentials. |
| `CONTENT_SOURCE=fixture` | Solo pruebas locales: genera el sitio con contenido de prueba sin Firestore. No desplegar ese build. |

`.env` y las claves de servicio están ignoradas por Git. Las reglas de Firestore
deniegan todo acceso desde navegadores: solo el Admin SDK del build lee datos.

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

`npm test` ejecuta las pruebas unitarias y de contratos. `npm run test:browser`
genera un build aislado con contenido de prueba (`CONTENT_SOURCE=fixture`) y
comprueba en Chromium los filtros, el tema entre islas, los enlaces ES/EN, los
fragmentos profundos, el teclado y el HTML servido sin JavaScript. Ese build de
prueba no debe desplegarse.

El build de producción recorre las diez colecciones, valida relaciones y genera
las rutas publicadas. Los artículos en borrador no se incluyen en el sitio ni
en el sitemap. Las reseñas de muestra se etiquetan y sus correos editoriales no
se publican.
