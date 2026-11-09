# Engineering Conventions

This is the normative reference for changing the portfolio. It describes the
rules that keep Astro, Vue, Firestore content and browser scripts on the correct
side of the rendering boundary.

For the reasoning behind these rules, see [architecture.md](architecture.md).
For a practical recipe, see [guides/adding-a-section.md](guides/adding-a-section.md).

## How to read this document

- **MUST** — required. A change that violates it is a defect.
- **MUST NOT** — forbidden.
- **SHOULD** — the default. Deviate only with a concrete reason and a comment.
- **MAY** — optional.

Rule identifiers are stable. Cite them in reviews and commits when a change is
about a convention rather than a feature.

The rules describe the current working tree. If the code and this document
disagree, treat the code as the starting point, decide which one is wrong, and
fix both in the same change.

## 1. Repository and feature layout

### R-LAYOUT-01 — Organize components by feature first

Components live under `src/components/<feature>/`. Each feature uses render
layers:

```text
src/components/
├── chrome/
│   └── astro/
├── home/
│   ├── astro/
│   └── vue/
├── projects/
│   ├── astro/
│   └── vue/
├── blog/
│   ├── astro/
│   ├── lib/
│   └── vue/
├── reviews/
│   ├── astro/
│   └── vue/
├── ui/
│   ├── astro/
│   └── vue/
└── islands/
    ├── blog/
    ├── home/
    ├── projects/
    └── reviews/
```

- `astro/` — components rendered entirely during the build.
- `vue/` — Vue implementation imported by another Vue component or an island.
- `lib/` — feature-specific non-component helpers, when needed.
- `islands/` — the only Vue entries that Astro may import.

`src/components/README.md` is the short entry point for this layout.

### R-LAYOUT-02 — Do not put loose component files at the components root

`src/components/` must contain only feature directories and `README.md`.
`tests/architecture.test.ts` enforces this.

### R-LAYOUT-03 — Keep cross-feature dependencies explicit and rare

A feature may depend on `ui`, `chrome` or an island entry. The only planned
cross-feature content dependencies are the home page using the blog teaser and
the home review section using the shared review card/invite from `reviews`.
Add a new cross-feature import only when the composition genuinely belongs to
the consuming page.

## 2. Astro conventions

### R-ASTRO-01 — Use `.astro` for local content, page structure and metadata

Local content from `src/data/content.ts`, route composition, layout, `<head>`,
canonical URLs, alternates and page-level SEO belong in `.astro` files.

```astro
---
import { content, type Locale } from '@/data/content'
const { locale } = Astro.props as { locale: Locale }
const copy = content[locale]
---
<h1>{copy.hero.name}</h1>
```

### R-ASTRO-02 — Type component props

Declare a `Props` interface or a typed destructure from `Astro.props`. Do not
use untyped page-level data.

### R-ASTRO-03 — Import Vue only through `components/islands/`

An `.astro` file **MUST NOT** import a `.vue` file outside
`src/components/islands/`. `tests/architecture.test.ts` enforces this.

```astro
---
// Correct
import StackSection from '@/components/islands/home/StackContent.vue'
// Incorrect
// import StackSection from '@/components/home/vue/StackSection.vue'
---
```

### R-ASTRO-04 — Hydrate only in the Astro consumer

`client:*` directives belong on the entry imported by `.astro`. Do not put a
directive on a child component or expect a `.vue` file to hydrate itself.

### R-ASTRO-05 — Import client scripts through `src/scripts/`

Astro-owned interactions use a module script that imports a file from
`src/scripts/`:

```astro
<script>import '@/scripts/site-chrome';</script>
```

The script must not fetch primary content. It enhances the HTML that Astro
already rendered.

### R-ASTRO-06 — Keep SEO in Astro

Title, description, canonical URL, alternate locales, indexability, Open Graph,
Twitter Cards, the robots meta tag and JSON-LD are Astro responsibilities,
including when the values come from Firestore. The HTML `<head>` must be
complete before Vue runs.

## 3. Vue conventions

### R-VUE-01 — Use Composition API and `<script setup lang="ts">`

All Vue components use `<script setup lang="ts">`. Do not introduce the Options
API.

### R-VUE-02 — Type the public contract

Use type-based `defineProps`, `defineEmits` and `defineModel`. Keep props
read-only; derive values with `computed` instead of mutating them.

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '@/data/projects'

const props = defineProps<{ project: Project }>()
const title = computed(() => props.project.title)
</script>
```

Use `defineModel` only for a genuine two-way component contract, as in
`ProjectsFilter.vue`.

### R-VUE-03 — Derive display data outside the template

Filtering, sorting, grouping, relation lookup and label selection belong in
`computed` values or pure helpers, not in complex template expressions.

### R-VUE-04 — Never import an Astro component from Vue

A `.vue` file **MUST NOT** import an `.astro` file. Use props, slots or a
feature-specific Vue component instead. `tests/architecture.test.ts` enforces
this.

### R-VUE-05 — Keep setup server-render safe

Do not read `window`, `document`, `localStorage` or browser-only APIs during
setup without a guard. Browser work belongs in `onMounted` or in a script that
only runs in the browser.

### R-VUE-06 — Keep published content in the initial HTML

If a record is part of the published page, render it in the server output. To
collapse it, use `hidden` or CSS, not `v-if`. Use `v-if` for transient UI that
does not need to exist before interaction.

The reviews section is the reference example: all review cards are in the HTML,
and cards after the fourth are hidden until the visitor expands the list or
follows a deep link.

### R-VUE-07 — Keep public content out of client Firestore queries

Vue receives validated public content through props. Firestore remains a
build-time source for the home, projects, experience, blog and review lists.

The visitor review flow is the only exception: it may read and write the
signed-in visitor's own `reviews/{uid}` document through `src/lib/reviews/`.
It **MUST NOT** read another visitor's review, list the collection or approve a
review from the browser.

## 4. Islands and hydration

### R-ISL-01 — `islands/` is the import boundary

Astro imports Vue only from `src/components/islands/`. The directory may contain
SSR-only entries and hydrated entries.

This is an import boundary, not a hydration boundary. A file under `islands/`
does not automatically receive client JavaScript.

### R-ISL-02 — Name entries by their rendering mode

- `*Island.vue` — hydrated entry.
- `*Content.vue` — SSR-only entry.

```text
src/components/islands/projects/ProjectsIndexIsland.vue  // client:load
src/components/islands/blog/ArticleContent.vue           // no client directive
```

### R-ISL-03 — Use `withIslandContext` for every entry

Every entry exports the view wrapped with `withIslandContext` from
`src/lib/withIslandContext.ts`.

```vue
<script lang="ts">
import { withIslandContext } from '@/lib/withIslandContext'
import ProjectsIndex from '@/components/projects/vue/ProjectsIndex.vue'
export default withIslandContext(ProjectsIndex)
</script>
```

The wrapper provides locale, route and content context per island. Do not
duplicate that setup in every feature.

### R-ISL-04 — Default to SSR-only

Managed content that only prints **MUST NOT** have a `client:*` directive.
Articles, the blog index, stack, experience, education and certifications are
the reference examples.

### R-ISL-05 — Choose the smallest hydration directive

| Need | Directive |
| --- | --- |
| No client state | none |
| Must be interactive immediately | `client:load` |
| Interaction below the fold | `client:visible` |
| Non-critical interaction after first paint | `client:idle` |

`client:only` is not used for public content because it gives up server HTML and
SEO.

### R-ISL-06 — Pass serializable props to hydrated islands

Props passed to a hydrated island must be serializable. SSR-only entries should
also receive plain data. Do not pass functions, class instances or live browser
objects; load dynamic data in the build or derive it inside the island.

## 5. Provenance decision table

Use this table before creating a component:

| Content source | Needs client state or events? | Implementation |
| --- | --- | --- |
| `src/data/content.ts` | No | Astro component |
| `src/data/content.ts` | Yes | Astro component + `src/scripts/*` |
| Firestore | No | Vue entry with no `client:*` |
| Firestore | Yes | Vue entry with the smallest `client:*` |
| SEO metadata or route structure | Either | Astro, always |

If a local section needs only a small interaction, prefer an Astro component
plus a focused script over hydrating a Vue tree.

## 6. Composition and slots

### R-COMP-01 — Use slots for static children of an interactive shell

Astro may pass children to a Vue entry. `withIslandContext` forwards default and
named slots to the Vue component.

```vue
<!-- Interactive Vue shell -->
<template>
  <section>
    <slot name="contact" />
  </section>
</template>
```

```astro
<InteractiveShell locale={locale} page="home" path={path}>
  <div slot="contact">Static Astro content</div>
</InteractiveShell>
```

The Vue component must not import the Astro component; it only receives the
rendered children.

### R-COMP-02 — Do not use slots for managed data

Pass Firestore records as props. Slots are for Astro-rendered presentation that
the Vue shell cannot produce itself.

> Current status: no shipped section uses slot forwarding after the header and
> footer moved to Astro. The capability is supported and covered by
> `tests/islands.test.ts`.

## 7. Cross-island state and storage

### R-STATE-01 — Do not share Vue state between islands

Islands are separate Vue roots. Do not rely on a module-level `reactive` object,
a singleton store or an event bus to synchronise them.

Use one of these channels instead:

- the URL and hash;
- `localStorage` for durable preferences;
- `sessionStorage` for one-shot navigation handoffs;
- DOM attributes such as `data-theme`;
- serialized props from Astro.

### R-STATE-02 — Theme contract

- Storage key: `localStorage["sl-theme"]`.
- DOM contract: `<html data-theme="dark|light">`.
- Initial application: inline script in `Layout.astro`.
- Toggle binding: `[data-theme-toggle]` in `src/scripts/site-chrome.ts`.
- CSS: semantic tokens react to `data-theme`.

Do not create a second theme storage key or a parallel theme class.

### R-STATE-03 — Locale contract

- Spanish is the unprefixed route.
- English is under `/en`.
- A locale switch is a real navigation, not in-memory state.
- Preserve the hash and save the scroll offset with
  `sessionStorage["sl-locale-scroll"]` before navigating.
- `src/scripts/locale-scroll.ts` restores the offset after load.

Do not add an in-place locale toggle that leaves the URL stale.

### R-STATE-04 — Hash and deep-link contract

- The URL hash is the shared section state.
- `src/scripts/site-chrome.ts` rewrites the hash with `history.replaceState`.
- `src/router/scrollControl.ts` pauses that rewrite while a deep-link scroll is
  in progress.
- `provideRoute` listens for `hashchange`, and `TestimonialsSection.vue`
  expands hidden cards before following a `#review-...` link.

Do not replace native anchor navigation with a separate JavaScript router.

### R-STATE-05 — Guard storage access

Every `localStorage` or `sessionStorage` call is wrapped in `try/catch` or
otherwise guarded. A disabled or full storage area must not break the page.

## 8. Routing, links and internationalization

### R-I18N-01 — Use localized routes

Public routes are:

- `/`, `/proyectos/`, `/blog/`, `/blog/:slug/`;
- `/en/`, `/en/proyectos/`, `/en/blog/`, `/en/blog/:slug/`.

Every public URL ends with a slash. Vue links must use `toHref` or `RouterLink`
from `src/router/astroRouter.ts`, not hand-built English paths. Named
destinations include `{ name: 'article', slug }`.

Blog indexes are scoped to their locale. An article without a translation stays
in the other locale's blog; do not generate a fallback route or a cross-language
card.

### R-I18N-02 — Mark translated text

Translated titles, excerpts, categories, article bodies and labels carry the
correct `lang` attribute. The document language is set in `Layout.astro`.

Visitor reviews are not translated. Each review stores the portfolio locale at
publish time and renders its quote with `lang`; the locale is silent in the UI
(no selector and no badge).

### R-I18N-03 — Preserve the fragment across locale changes

The `LocaleSwitch.astro` link flow, completed by `src/scripts/site-chrome.ts`,
keeps the current hash when changing language. Do not drop the hash during a
locale navigation.

### R-SEO-01 — SEO belongs to Astro

Even when title or description comes from Firestore, compute it in the Astro
route and pass it to `Layout.astro`. Do not update metadata from a hydrated
island for primary content.

### R-SEO-02 — Build JSON-LD and social metadata in Astro

Use the pure builders in `src/lib/seo.ts` to generate JSON-LD and pass the result
to `Layout.astro`. Keep `@id` values and absolute URLs stable across renders.
Structured data must describe visible content: do not add ratings, reviews or
properties the page does not show. `serializeJsonLd` must escape `<` before the
script is rendered.

### R-SEO-03 — Generate the sitemap from the validated snapshot

The sitemap is built from `loadContent()` by
`src/pages/sitemap-0.xml.ts` through `src/lib/sitemap.ts`. It must contain only
canonical, indexable URLs, with `lastmod` for articles and `xhtml:link`
alternates for pages available in both locales. Do not add URLs that are
`noindex`, redirects or missing translations.

## 9. Content, schemas and media

### R-DATA-01 — Validate at the build boundary

Every Firestore collection is parsed with its Zod schema. The content graph is
validated before pages are generated. An empty collection is a build error,
except `reviews`: a new site has no approved reviews and must still build to
show the empty state and the review call to action.

### R-DATA-02 — Use stable identifiers

Projects, experiences and reviews relate through stable IDs and slugs. Use the
helpers in `src/data/relations.ts` and the anchors in `src/data/anchors.ts`
rather than constructing IDs by hand.

### R-DATA-03 — Keep non-public review fields out of public output

Public models expose only what the review card renders. `toPublicTestimonial`
keeps the author name, roles, photo and email, and strips `approved`,
`authorUid`, `source` and `order`. The email is intentionally public in the
approved review; do not add other private fields to the public model.

### R-DATA-04 — Keep media paths relative in Firestore

Store `/images/...` and `/files/...` paths in Firestore. The build prepends
`PUBLIC_MEDIA_URL`. Do not store absolute R2 URLs.

`public/images` and `public/files` are reserved for dynamic media and must not
exist in the repository. Static assets belong in `src/assets` or a non-reserved
public path.

### R-DATA-05 — Use fixtures for deterministic tests

Tests and local verification use `CONTENT_SOURCE=fixture`. Do not deploy a
fixture build.

### R-DATA-06 — Treat visitor reviews as untrusted input

Visitor reviews are validated twice: Zod at the build boundary and Firestore
Rules at the write boundary. Limits live in `REVIEW_LIMITS` (40–400 characters,
1–3 roles, up to 3 relations); the rules repeat the numbers because they cannot
import TypeScript. Render review text as text interpolation, never `v-html`.

### R-DATA-07 — Publish only approved reviews

The build queries `reviews` with `where('approved', '==', true)`. Pending
reviews never enter the content graph. `approved` defaults to `false` on every
client write; only the Admin SDK/Console can set it to `true`. After approval,
a new build/deploy is required for the review to appear.

### R-DATA-08 — Publish the review author identity intentionally

`author.email` is stored in the review document and published in the approved
review card as a `mailto:` link. Firestore Rules still allow only the owner and
the Admin SDK to read the stored document; the static build is the only place
that exposes the email. It is PII and therefore scrapeable. The access and
publish screens do not carry a dedicated public-email warning; the preview
shows the email in the card. Do not add other private fields to the public
model. Google profile photos
must match `*.googleusercontent.com`; the URL is capped at 4096 characters.
Firestore stores only the URL, not the binary; the `Avatar` falls back to
initials on load error. A future upload/proxy path should enforce the 10 MB
byte limit on the image itself.

### R-DATA-09 — Keep review identity immutable

Clients write `id`, `authorUid`, `source`, `anchorId` and `createdAt` once.
`id` equals the UID, `anchorId` is the public slug, `source` is `visitor`, and
`approved` remains `false`. Updates may change only the author metadata, roles,
quote, locale, relations and `updatedAt`.

## 10. Visitor review authentication

### R-AUTH-01 — Keep the Firebase web SDK out of SSR and public features

The Firebase web SDK is browser-only. It lives behind `src/lib/firebase/` and is
imported dynamically from `onMounted` or event handlers. A static import in a
component that Astro renders on the server is forbidden. The home, projects and
blog features must never import it.

### R-AUTH-02 — Only Google, only the owner

The login page exposes Google only. The browser may `get` its own
`reviews/{uid}` document and may create/update that document while
`approved == false`. It must not list the collection, read another document,
delete its document or change the approval flag.

### R-AUTH-03 — Keep auth pages out of search

`/resenas/` and `/resenas/panel/` are `noindex, follow`, have no canonical or
alternate metadata and are absent from the sitemap. Do not add them to
`robots.txt` as disallowed; the noindex meta is the signal.

### R-AUTH-04 — Keep personalized data out of static HTML

The review pages are prerendered. Their initial HTML must contain only the
neutral shell: no user name, email, photo, review content or approval state.
The island resolves the session after hydration.

### R-STATE-06 — Review draft storage

The review panel may persist a draft in `sessionStorage["sl-review-draft"]`
with the owner UID, a version and a timestamp. Never store the email. Clear the
draft on publish, sign-out and when an approved review is loaded. Guard every
storage access like R-STATE-05.

## 11. Client scripts

### R-SCRIPT-01 — Scripts enhance, they do not render primary content

Files in `src/scripts/` may update the DOM, manage focus, observe visibility or
persist preferences. They must not fetch and render the main page content.

### R-SCRIPT-02 — Use `data-*` hooks

JavaScript selectors use `data-*` attributes, not presentation classes.

```html
<button data-copy-email data-email="hello@example.com">Copy</button>
```

### R-SCRIPT-03 — Clean up long-lived work

Remove listeners, disconnect observers and cancel animation frames on
`pagehide` when the script owns them. Passive scroll/resize listeners are the
default.

### R-SCRIPT-04 — Respect reduced motion and missing APIs

Guard `matchMedia`, `IntersectionObserver`, `clipboard` and similar APIs. When
reduced motion is requested, skip or immediately settle the animation.

### R-SCRIPT-05 — Do not touch `astro-island`

Vue owns hydrated subtrees. Static reveal or navigation scripts must ignore
elements inside `astro-island`; `src/scripts/reveal.ts` is the reference.

## 12. Styling, theme and motion

### R-STYLE-01 — Use semantic theme tokens

Prefer Tailwind classes backed by semantic tokens (`bg-page`, `text-ink`,
`border-line`, `text-soft`) over raw colours. Raw palette values are acceptable
only inside isolated artwork such as the identity plate.

### R-STYLE-02 — Theme through `data-theme`

Theme changes are expressed through `data-theme` and the semantic tokens in
`src/assets/main.css`. Do not add a second theme selector or hard-code a
component to one theme unless it is intentional artwork.

Theme-aware images use the `theme-media-dark` / `theme-media-light` classes.
Both variants may exist in the server HTML; CSS reveals the active one. When
`darkSrc` is absent or equal to `src`, render a single image instead of two
copies of the same source.

### R-STYLE-03 — Scope component styles

Use `<style scoped>` in Vue and Astro component styles for component-specific
motion or layout. Put tokens, resets and truly global rules in
`src/assets/main.css`.

### R-STYLE-04 — Gate motion

Animations run under `@media (prefers-reduced-motion: no-preference)` or check
the preference in script. Content must remain visible and usable when motion is
disabled.

## 13. Accessibility

### R-A11Y-01 — Preserve keyboard access

Interactive controls must be reachable and operable by keyboard. The mobile
menu, skill tabs, project filters, skip link and theme controls are reference
cases.

### R-A11Y-02 — Manage focus deliberately

When a menu, tab panel or deep-linked card opens, move focus only when the
interaction requires it. Return focus to the trigger when closing a disclosure.

### R-A11Y-03 — Use semantic states

Use `aria-expanded`, `aria-selected`, `aria-pressed`, `aria-controls`,
`aria-current`, `aria-live` and `hidden` according to the widget's actual state.
Do not use ARIA to simulate a state the DOM does not have.

### R-A11Y-04 — Keep the skip link and one main target

Every page has one `main#main` and the global skip link targets it. Do not add a
second main landmark.

## 14. Testing and verification

### R-TEST-01 — Protect the boundary with architecture tests

When adding or changing an import boundary, provenance rule or hydration
guarantee, update `tests/architecture.test.ts`.

### R-TEST-02 — Verify the no-JavaScript HTML

Primary content must be present with JavaScript disabled. `tests/browser.test.ts`
checks articles, project cards, home sections, the hero and the article outline
without JavaScript.

### R-TEST-03 — Verify interactions in a browser

Filters, deep links, theme persistence, locale navigation, keyboard controls and
progressive-enhancement scripts are browser tests, not unit tests.

### R-TEST-04 — Use the fixture build for browser verification

`npm run test:browser` builds with `CONTENT_SOURCE=fixture` and
`PUBLIC_MEDIA_URL`, then serves the result. That build is for verification only.

### R-TEST-05 — Run the full check before finishing

```sh
npm run check
npm test
npm run test:browser
```

`npm run build:fixture` is also useful when changing Astro routes or Vue SSR
output.

## 15. Naming

| Kind | Convention | Example |
| --- | --- | --- |
| Vue component | PascalCase | `ProjectTile.vue` |
| Hydrated island entry | `*Island.vue` | `ProjectsIndexIsland.vue` |
| SSR-only island entry | `*Content.vue` | `ArticleContent.vue` |
| Composable | `use*` | `useRevealCycle` |
| Script module | kebab-case behaviour | `site-chrome.ts`, `article-navigation.ts` |
| Data attribute hook | kebab-case `data-*` | `data-copy-email`, `data-menu-toggle` |
| Storage key | `sl-` prefix | `sl-theme`, `sl-locale-scroll` |
| Anchor ID | domain prefix | `project-...`, `experience-...`, `review-...` |

## 16. Anti-patterns

- Importing `components/home/vue/HeroSection.vue` directly from an `.astro`
  file instead of an island entry.
- Adding `client:load` to an article or blog index that has no interaction.
- Fetching Firestore from a Vue `onMounted`.
- Building a global Vue store to synchronise independent islands.
- Using `v-if` for published content that must be in the initial HTML.
- Adding a second `localStorage` key for the theme.
- Hard-coding `/en/...` links inside a Vue component instead of using `toHref`.
- Hydrating a local section merely to animate it; use CSS or a script.
- Letting a static reveal script hide content inside `astro-island`.
- Storing absolute R2 URLs in Firestore.
- Publishing private review fields other than the intentionally public name, photo, roles and email.
- Letting the browser read or list reviews other than its own.
- Writing `approved: true` from client code.
- Importing the Firebase web SDK during SSR or from public content features.
- Rendering visitor review text with `v-html`.
- Adding `/resenas/` to the sitemap or treating it as indexable public content.

## Appendix A — Canonical files

| Concern | File |
| --- | --- |
| Document shell and SEO | `src/layouts/Layout.astro` |
| Home composition | `src/components/home/astro/HomePage.astro` |
| Projects index | `src/components/projects/astro/ProjectsPage.astro` |
| Blog index and article routes | `src/components/blog/astro/BlogPage.astro`, `ArticlePage.astro` |
| Island context | `src/lib/withIslandContext.ts` |
| Route helpers | `src/router/astroRouter.ts` |
| Hash synchronisation | `src/router/scrollControl.ts` |
| Theme store | `src/stores/theme.ts` |
| Header and footer | `src/components/chrome/astro/` |
| Content loading | `src/lib/server/content.ts` |
| Structured data and social metadata | `src/lib/seo.ts` |
| Sitemap | `src/lib/sitemap.ts`, `src/pages/sitemap-0.xml.ts`, `src/pages/sitemap-index.xml.ts` |
| Schemas | `src/data/schemas/` |
| Review contract and helpers | `src/data/reviews.ts`, `src/data/schemas/review.ts` |
| Review auth and repository | `src/lib/firebase/`, `src/lib/reviews/` |
| Review pages and islands | `src/components/reviews/`, `src/components/islands/reviews/` |
| Firestore security rules | `firestore.rules` |
| Relations and anchors | `src/data/relations.ts`, `src/data/anchors.ts` |
| Client scripts | `src/scripts/` |

## Appendix B — Browser contracts

| Contract | Value |
| --- | --- |
| Theme storage | `localStorage["sl-theme"]` |
| Theme DOM state | `<html data-theme="dark|light">` |
| Locale | `/` and `/en/...` |
| Locale scroll handoff | `sessionStorage["sl-locale-scroll"]` |
| Review draft | `sessionStorage["sl-review-draft"]` |
| Section hash | `window.location.hash` |
| Theme toggle hook | `[data-theme-toggle]` |
| Mobile menu hook | `[data-menu-toggle]`, `#mobile-menu` |
| Copy email hook | `[data-copy-email]` |
| Article progress | `[data-reading-progress]` |
| Article outline | `[data-article-toc]` |

## Appendix C — Hydration matrix

| Surface | Entry | Directive |
| --- | --- | --- |
| Projects index | `ProjectsIndexIsland.vue` | `client:load` |
| Home projects | `ProjectsIsland.vue` | `client:visible` |
| Reviews | `TestimonialsIsland.vue` | `client:idle` |
| Review access | `ReviewsAccessIsland.vue` | `client:load` |
| Review panel | `ReviewPanelIsland.vue` | `client:load` |
| Stack | `StackContent.vue` | none |
| Experience | `ExperienceContent.vue` | none |
| Education | `EducationContent.vue` | none |
| Certifications | `CertificationsContent.vue` | none |
| Blog teaser | `BlogContent.vue` | none |
| Blog index | `BlogIndexContent.vue` | none |
| Article | `ArticleContent.vue` | none |
