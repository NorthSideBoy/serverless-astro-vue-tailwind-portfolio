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

`tests/architecture.test.ts` verifica las reglas 1, 2 y la separación actual
entre contenido local en Astro y contenido Firestore en Vue.

## Primitivas compartidas

`ui/astro/` y `ui/vue/` contienen gemelas de las primitivas que necesitan ambos
mundos. Actualmente son:

- `PlateFrame`
- `SealEyebrow`
- `SectionHeader`
- `UiIcon`
- `Avatar` (foto o iniciales; solo Vue)
- `GoogleMark` (marca de Google; solo Vue)

Otras primitivas viven en un solo mundo:

- `CodeBlock` y `TechIcon` solo existen en `ui/vue/`.
- `LayerPlate` solo existe en `ui/astro/`.

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
