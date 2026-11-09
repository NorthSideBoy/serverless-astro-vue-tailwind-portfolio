# Engineering Documentation

This directory explains how the portfolio is built and how to change it without
breaking its rendering boundary.

## Audience

The documents are written for:

- maintainers of this repository;
- AI coding agents working on the codebase;
- contributors who already know Astro and Vue and need the project-specific rules.

They assume familiarity with components, props, static generation and the
browser DOM. They do not teach Astro or Vue.

## Document map

| Document | Diátaxis type | Use it when |
| --- | --- | --- |
| [architecture.md](architecture.md) | Explanation | You need to understand why the site is split between Astro and Vue, how content reaches the HTML, or how islands communicate. |
| [conventions.md](conventions.md) | Reference | You need the normative rule for a file, component, hydration directive, script, data contract or test. |
| [guides/adding-a-section.md](guides/adding-a-section.md) | How-to | You are adding or changing a section and need the end-to-end recipe. |

Supporting context:

- [../README.md](../README.md) — project overview, setup and environment variables.
- [../PRODUCT.md](../PRODUCT.md) — product scope, audiences and constraints.
- [../DESIGN.md](../DESIGN.md) — visual system and design rules.
- [../src/components/README.md](../src/components/README.md) — short component-layout guide that points back here.

## Recommended reading paths

- **New to the repository:** `architecture.md` → `conventions.md` → `guides/adding-a-section.md`.
- **Adding a section:** `guides/adding-a-section.md` → the relevant rules in `conventions.md`.
- **Reviewing a change:** `conventions.md` → `tests/architecture.test.ts` and `tests/browser.test.ts`.
- **Changing hydration or state:** the island, state and testing sections of `conventions.md`, then `architecture.md` for the rationale.

## Source of truth

The current working tree is the source of truth. The documents describe the
implemented architecture, not an aspirational one.

The boundary is also enforced by code:

- `tests/architecture.test.ts` checks the Astro/Vue import boundary and the
  current provenance split.
- `tests/reviews.test.ts` checks the review schema, public projection, draft
  validation and Firebase error mapping.
- `tests/browser.test.ts` checks the server-rendered HTML, hydration, deep
  links, theme persistence, keyboard behaviour, locale navigation and review
  shells.
- `tests/islands.test.ts` checks per-island context and slot forwarding.

`PRODUCT.md` and `DESIGN.md` remain the source of truth for product and visual
decisions. Engineering documents link to them instead of copying them.

## Vocabulary

- **Local content** — copy and data that live in the repository, mainly
  `src/data/content.ts`.
- **Managed content** — editorial records loaded from Firestore during the
  build, plus approved visitor reviews.
- **Astro shell** — routes, layout, metadata and page composition rendered by
  Astro.
- **Visitor review** — a Google-authenticated submission stored at
  `reviews/{uid}` with `approved: false` until moderation.
- **Auth island** — a hydrated Vue entry that lazily loads the Firebase web SDK
  for sign-in and the owner-only review document.
- **Island entry** — a Vue component under `src/components/islands/` that an
  Astro file is allowed to import.
- **SSR-only entry** — an island entry rendered to HTML at build time with no
  `client:*` directive.
- **Hydrated island** — an island entry with a `client:*` directive that boots
  Vue in the browser.
- **Provenance** — where the content comes from: local files or Firestore.

## Maintenance rule

When a boundary changes, update the code, the relevant document and the test
that protects it in the same change. A convention that cannot be enforced by a
test should still have a concrete file example and a stated rationale.

## Future boundary

The planned CMS at `/admin` and the hosting deploy hook are not implemented.
They are documented briefly in [architecture.md](architecture.md#future-cms-and-deploy-hook)
as an architectural intention, not as current behaviour.
