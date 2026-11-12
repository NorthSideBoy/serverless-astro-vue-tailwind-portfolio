# Componentes

La carpeta se organiza primero por feature y, dentro de cada feature, por capa
de render:

```text
components/
├── chrome/     Header, footer y controles persistentes
├── home/       Página y secciones de la home
├── projects/   Índice, tarjetas y carrusel (máx. 5 en la home)
├── blog/       Índice, artículo y renderers editoriales
├── reviews/    Acceso, panel, tarjeta e invitación de reseñas
├── ui/         Primitivas compartidas
└── islands/    Entradas Vue que Astro importa (incluye reviews/)
```

Cada feature usa las mismas subcarpetas:

- `astro/` — componentes que se renderizan al 100% durante el build. No tienen
  estado reactivo ni eventos de cliente.
- `vue/` — implementación de componentes Vue. Solo puede importarlos otro
  componente Vue o una isla.
- `lib/` — helpers específicos del feature que no son componentes, cuando
  existen.

## Frontera Astro / Vue

1. Un archivo `.astro` **nunca** importa un `.vue` que no esté bajo
   `components/islands/`.
2. Un archivo `.vue` **nunca** importa un `.astro`.
3. `components/islands/` es la única puerta de importación Astro → Vue, pero
   **no** obliga a hidratar. Puede contener entradas SSR-only sin `client:*`.
4. Los wrappers de `islands/` usan `withIslandContext` (`src/lib`) para recibir
   locale, ruta y contenido sin duplicar esa lógica en cada isla.
5. `chrome/astro/SiteHeader.astro` y `chrome/astro/SiteFooter.astro` son
   componentes Astro estáticos. Las páginas los componen directamente; no
   existen islas de header o footer.
6. Los nombres distinguen el modo de render:
   - `*Island.vue` — entrada hidratada.
   - `*Content.vue` — entrada renderizada solo en build.

`tests/architecture.test.ts` verifica las reglas 1, 2, la separación actual
entre contenido editorial en Vue y contenido local en Astro, y que el formulario
de contacto cargue Firebase solo al enviar.

## Primitivas compartidas

`ui/astro/` y `ui/vue/` contienen gemelas de las primitivas que necesitan ambos
mundos. Actualmente son:

- `PlateFrame`
- `SealEyebrow`
- `SectionHeader`
- `UiIcon` (Lucide; vocabulario en `ui/icon-names.ts` y mapas gemelos en
  `ui/astro/icon-map.ts` y `ui/vue/icon-map.ts`)
- `Avatar` (foto o iniciales; solo Vue)

Otras primitivas viven en un solo mundo:

- `CodeBlock` y `TechIcon` solo existen en `ui/vue/`. `TechIcon` recibe un
  path resuelto de Simple Icons o un `customIcon` de R2 renderizado con
  máscara.

## Iconografía

- Los glifos de interfaz son Lucide y pasan siempre por `UiIcon`; no se
  escribe un `<svg>` nuevo en una sección.
- Para añadir un icono: agrega el nombre kebab-case a `ui/icon-names.ts`,
  importa el componente en `ui/astro/icon-map.ts` y `ui/vue/icon-map.ts`, y
  ejecuta `npm run check`.
- `UiIcon` es decorativo (`aria-hidden="true"`); el nombre accesible va en el
  control o en un `sr-only` hermano.
- Las marcas GitHub, Google y WhatsApp se importan directamente desde
  `simple-icons` en `ui/brand-icons.ts`; son estáticas y no se generan.
- Los iconos de tecnología se resuelven en build con
  `src/lib/server/techIcons.ts`: normalización y búsqueda por slug/título,
  sin excepciones por clave. Las claves ambiguas usan `customIcon`.
- `customIcon` es una ruta relativa en minúsculas `/images/...svg`, solo para
  tecnologías de Stack, y tiene prioridad sobre `icon`. El portfolio la
  renderiza con `mask-image`, así que hereda `currentColor` y el hover de
  marca. La máscara usa el alpha del SVG: el icono se ve monocromo. El CMS
  `/admin` futuro sube y sanitiza el SVG; el portfolio no inlinea SVG crudo.
- El build hace un `HEAD` a cada `customIcon`; si el objeto no existe, no es
  SVG, falla CORS o la red falla, avisa y el tile cae en `FileCode2` (no usa
  `icon` como sustituto porque el custom es autoritativo).
- Convención R2: key `images/tech-icons/<slug>.svg`, `Content-Type:
  image/svg+xml`, `Cache-Control: public, max-age=31536000, immutable`; CORS
  debe permitir `GET`/`HEAD`.
- `node`, `fish`, `jwt` y `playwright` usan `customIcon` en R2 para evitar
  depender del primer resultado del buscador. `playwright` además no existe
  en Simple Icons 16.
- Simple Icons es CC0; las marcas siguen siendo trademarks de sus dueños.
- Guía operativa: [`docs/guides/tech-icons.md`](../../docs/guides/tech-icons.md).
- `IdentityPlateSheet`, los monogramas NSB/SL y el favicon son arte, no iconos
  de UI.

Si cambias la marca, los estilos o el comportamiento de una primitiva gemela,
cambia también la otra. Los imports deben respetar el framework del consumidor:

- una sección `.astro` usa `ui/astro/...`;
- una sección `.vue` usa `ui/vue/...`.

## Dependencias entre features

`home` importa el teaser del blog desde `blog` y la tarjeta/invitación de
reseñas desde `reviews` porque la home muestra ese contenido. Son las únicas
dependencias cruzadas previstas; para todo lo demás, una feature solo depende
de `ui`, `chrome` o `islands`.

La arquitectura y las reglas completas están en
[`docs/architecture.md`](../../docs/architecture.md) y
[`docs/conventions.md`](../../docs/conventions.md).
