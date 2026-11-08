# Adding or Changing a Section

This guide takes a section from decision to verified implementation. It covers
local Astro sections, managed Vue SSR-only sections and hydrated Vue islands.

For the rules behind these steps, see [../conventions.md](../conventions.md).
For the rationale, see [../architecture.md](../architecture.md).

## 1. Choose the rendering path

```text
Does the section render content from Firestore?
├── No ── Does it need client state or browser events?
│         ├── No  → Astro component
│         └── Yes → Astro component + src/scripts/*
└── Yes ─ Does it need client state or browser events?
          ├── No  → Vue entry with no client directive (`*Content.vue`)
          └── Yes → Vue entry with the smallest client directive (`*Island.vue`)
```

Use the smallest solution:

| Interaction | Prefer |
| --- | --- |
| Copy to clipboard, tabs, menu, counters, plate animation | Astro + `src/scripts/` |
| Project filtering | Vue island, `client:load` |
| Carousel or details below the fold | Vue island, `client:visible` |
| Collapsible reviews after first paint | Vue island, `client:idle` |

## 2. Add a local Astro section

Use this path for content in `src/data/content.ts` that needs no client state.

1. Create `src/components/<feature>/astro/<Name>Section.astro`.
2. Type the props and read the copy from `src/data/content.ts`.
3. Render semantic HTML with the existing UI primitives.
4. Add the section to the page composer (`HomePage.astro` for home sections).
5. If it has an anchor, add the matching navigation ID in the content model.

```astro
---
import { content, type Locale } from '@/data/content'
import SectionHeader from '@/components/ui/astro/SectionHeader.astro'

interface Props { locale: Locale }
const { locale } = Astro.props
const copy = content[locale].services
---
<section id="services" aria-labelledby="services-title">
  <SectionHeader
    eyebrow={copy.eyebrow}
    title={copy.title}
    lead={copy.lead}
    titleId="services-title"
  />
  <!-- section content -->
</section>
```

If the section needs a small behaviour, add a script file in `src/scripts/` and
import it from the Astro component:

```astro
<script>import '@/scripts/skills-layers';</script>
```

## 3. Add a managed Vue SSR-only section

Use this path for Firestore content that only needs to be printed.

### 3.1 Build the feature component

Create `src/components/<feature>/vue/<Name>Section.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { Locale } from '@/data/content'
import type { ExperienceEntry } from '@/data/experience'

const props = defineProps<{
  locale: Locale
  items: ExperienceEntry[]
}>()

const visibleItems = computed(() => props.items)
</script>

<template>
  <section id="experience">
    <article v-for="item in visibleItems" :key="item.id">
      {{ item.summary[locale] }}
    </article>
  </section>
</template>
```

Keep data derivation in `computed` values. Do not fetch Firestore and do not
read browser APIs during setup.

### 3.2 Add the island entry

Create `src/components/islands/<feature>/<Name>Content.vue`:

```vue
<script lang="ts">
import { withIslandContext } from '@/lib/withIslandContext'
import ExperienceSection from '@/components/home/vue/ExperienceSection.vue'

export default withIslandContext(ExperienceSection)
</script>
```

Use the `Content` suffix because this entry has no `client:*` directive.

### 3.3 Pass it from Astro

Import the entry from `islands/` and pass validated data:

```astro
---
import ExperienceSection from '@/components/islands/home/ExperienceContent.vue'
import { loadContent } from '@/lib/server/content'
import type { Locale } from '@/data/content'

const { locale } = Astro.props as { locale: Locale }
const data = await loadContent()
---
<ExperienceSection
  locale={locale}
  entries={data.experience}
  projects={data.projects}
  reviews={data.reviews}
  section={data.sections.experience}
/>
```

Do not add a client directive. The server HTML is the deliverable.

## 4. Add an interactive Vue island

Use this path only when the section needs client state or browser events.

### 4.1 Build the feature component

Keep the interaction and the content it controls in the same Vue tree. For
example, the projects index owns its filter and its cards so the filter can
drive the grid directly.

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import type { Project } from '@/data/projects'

const selected = shallowRef<'all' | 'collaborations'>('all')
const props = defineProps<{ projects: Project[] }>()
</script>

<template>
  <div>
    <button
      type="button"
      :aria-pressed="selected === 'collaborations'"
      @click="selected = 'collaborations'"
    >
      Collaborations
    </button>
    <article v-for="project in props.projects" :key="project.slug">
      {{ project.title.es }}
    </article>
  </div>
</template>
```

### 4.2 Add the island entry

Use the `Island` suffix:

```vue
<script lang="ts">
import { withIslandContext } from '@/lib/withIslandContext'
import ProjectsIndex from '@/components/projects/vue/ProjectsIndex.vue'

export default withIslandContext(ProjectsIndex)
</script>
```

### 4.3 Hydrate from Astro with the smallest directive

```astro
<ProjectsIndex
  locale={locale}
  page="projects"
  path={path}
  content={{ sections: data.sections, projects: data.projects, experiences: data.experience, reviews: data.reviews }}
  client:load
/>
```

Choose `client:visible` or `client:idle` when the interaction is below the fold
or not critical to first paint.

### 4.4 Keep the initial HTML complete

If a record is part of the published content, render it in the server output and
hide it with `hidden` when collapsed. Do not use `v-if` to keep published records
out of the initial HTML.

## 5. Add a progressive-enhancement script

Use a script when an Astro section needs a small interaction but not a Vue tree.

1. Add `src/scripts/<behaviour>.ts`.
2. Select elements with `data-*` attributes.
3. Guard missing APIs and reduced motion.
4. Clean up on `pagehide`.
5. Import the script from the owning Astro component.

```ts
const button = document.querySelector<HTMLButtonElement>('[data-copy-email]')
if (button) {
  button.addEventListener('click', () => {
    // enhance the existing HTML
  })
}
```

Do not let the script hide or replace content inside `astro-island`.

## 6. Add or update tests

### Architecture

If the change introduces a new boundary or provenance rule, update
`tests/architecture.test.ts`.

### Browser

If the change affects HTML without JavaScript, deep links, keyboard behaviour,
theme, locale or an interaction, add a case to `tests/browser.test.ts`.

### Contracts

If the change adds a schema, a relation or a public mapper, add a unit test in
`tests/` and use the fixture source where appropriate.

## 7. Verify

```sh
npm run check
npm test
npm run build:fixture
npm run test:browser
```

For browser tests, confirm:

- the content is present with JavaScript disabled;
- the interaction works with keyboard and pointer;
- the hash or locale URL is preserved when relevant;
- the page still works with reduced motion;
- no editorial private data appears in HTML or island props.

## Checklist

- [ ] The content source is local or Firestore, and the renderer matches the
      decision table.
- [ ] Astro imports Vue only from `src/components/islands/`.
- [ ] The entry is `*Content.vue` if SSR-only and `*Island.vue` if hydrated.
- [ ] The entry uses `withIslandContext`.
- [ ] The hydration directive is the smallest one that works.
- [ ] Published content is in the initial HTML.
- [ ] Local interactions use `src/scripts/` when Vue is unnecessary.
- [ ] Links use `toHref` or `RouterLink` inside Vue.
- [ ] Translated text has `lang`.
- [ ] Keyboard, focus and reduced motion still work.
- [ ] Architecture and browser tests are updated when the boundary changes.
