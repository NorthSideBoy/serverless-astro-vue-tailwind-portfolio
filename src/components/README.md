# Componentes

La carpeta se organiza primero por feature y, dentro de cada feature, por capa
de render:

```text
components/
├── chrome/     Header, footer y controles persistentes
├── home/       Página y secciones de la home
├── projects/   Índice, tarjetas y carrusel
├── blog/       Índice, artículo y renderers editoriales
├── ui/         Primitivas compartidas
└── islands/    Entradas Vue que Astro hidrata
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
3. `components/islands/` es la única puerta de hidratación. Cada entrada se
   importa desde Astro con una directiva `client:*`.
4. Los wrappers de `islands/` usan `withIslandContext` (`src/lib`) para recibir
   locale, ruta y contenido sin duplicar esa lógica en cada isla.
5. `chrome/astro/SiteHeader.astro` y `chrome/astro/SiteFooter.astro` centralizan
   la hidratación del chrome. Las páginas no importan sus islas directamente.

`tests/architecture.test.ts` verifica las reglas 1 y 2.

## Primitivas compartidas

`ui/astro/` y `ui/vue/` contienen twins de las primitivas que necesitan ambos
mundos: `CodeBlock`, `PlateFrame`, `SealEyebrow`, `SectionHeader` y `UiIcon`.
Si cambias la marca, los estilos o el comportamiento de una, cambia también la
otra. Los imports deben respetar el framework del consumidor:

- una sección `.astro` usa `ui/astro/...`;
- una sección `.vue` usa `ui/vue/...`.

## Dependencias entre features

`home` importa `BlogSection` desde `blog` porque la home muestra el teaser del
blog. Es la única dependencia cruzada prevista; para todo lo demás, una feature
solo depende de `ui`, `chrome` o `islands`.
