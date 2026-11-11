---
name: Said Lucena — Portfolio
description: An engineering dossier for a backend-leaning developer; registry cyan on ink-black, filed on square technical plates.
colors:
  canvas: '#06090b'
  surface: '#0a1318'
  sunken: '#10191f'
  panel: '#142026'
  panel-raised: '#1a2b32'
  hairline: '#213239'
  hairline-strong: '#314650'
  ink: '#e6eef2'
  muted: '#7c8a93'
  glyph: '#c2d2d9'
  registry-cyan: '#9ef0ff'
  ion-cyan: '#58e1ff'
  signal-blue: '#00a8f4'
  telemetry-aqua: '#00e5d0'
  deep-sky: '#0ea5e9'
  interface-violet: '#a855f7'
  on-action: '#041014'
  alert-rose: '#ff8a93'
typography:
  display:
    fontFamily: "'Fraunces Variable', Georgia, 'Times New Roman', serif"
    fontSize: 'clamp(44px, 7vw, 92px)'
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: '-0.035em'
  headline:
    fontFamily: "'Space Grotesk Variable', 'Inter Variable', ui-sans-serif, sans-serif"
    fontSize: 'clamp(30px, 3.4vw, 46px)'
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: '-0.025em'
  title:
    fontFamily: "'Space Grotesk Variable', 'Inter Variable', ui-sans-serif, sans-serif"
    fontSize: 'clamp(17px, 1.6vw, 24px)'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '-0.02em'
  body:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '16px'
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, monospace"
    fontSize: '11px'
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: '0.14em'
rounded:
  plate: '0px'
  xs: '4px'
  sm: '8px'
  pill: '9999px'
spacing:
  gutter-sm: '24px'
  gutter-md: '56px'
  gutter-xl: '120px'
  section-y-compact-sm: '44px'
  section-y-compact-md: '60px'
  section-y-compact-xl: '84px'
  section-y-sm: '56px'
  section-y-md: '76px'
  section-y-xl: '120px'
  section-y-lead-sm: '64px'
  section-y-lead-md: '96px'
  section-y-lead-xl: '144px'
  gap-card: '16px'
components:
  button-primary:
    backgroundColor: '{colors.signal-blue}'
    textColor: '{colors.on-action}'
    rounded: '{rounded.pill}'
    padding: '0 28px'
    height: '52px'
  button-ghost:
    textColor: '{colors.registry-cyan}'
    rounded: '{rounded.pill}'
    padding: '0 28px'
    height: '52px'
  tech-chip:
    textColor: '{colors.muted}'
    rounded: '{rounded.xs}'
    padding: '4px 10px'
  field:
    backgroundColor: '{colors.sunken}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '12px 14px'
  plate-card:
    backgroundColor: '{colors.panel}'
    textColor: '{colors.ink}'
    rounded: '{rounded.plate}'
    padding: '20px'
  filter-pill:
    textColor: '{colors.muted}'
    rounded: '{rounded.pill}'
    padding: '10px 16px'
  contact-pill:
    textColor: '{colors.ink}'
    rounded: '{rounded.pill}'
    padding: '11px 18px'
---

# Design System: Said Lucena — Portfolio

## Overview

**Creative North Star: "The Engineering Dossier"**

This site reads as a technical dossier filed by the engineer it documents. Every surface behaves like a page from a working file: square plates bordered by single hairlines, registration ticks at the corners, monospace micro-labels whose chapter index is a kanji numeral in a hairline box ("二 // HABILIDADES TÉCNICAS"), and identity artwork rendered as generated schematic plates (dot-matrix, orbital networks, access meshes). Nothing is rounded-soft or marketing-glossy; the page is calm, instrumented, and slightly bureaucratic in the way an engineering record is calm.

The palette comes from the Hyprland cyan-to-aqua family laid on near-black ink; the emotional register comes from the portfolio's own seal glyphs — the section numerals 零–十一 and the words 構 (structure) and 設計 (design) — used as sparse stamps, never as decoration, and the dossier eyebrow "零 // DOSSIER". Registry cyan is the system's living signal: it marks what is interactive, current, or selectable. Depth is carried by tonal surfaces and hairlines, not by shadows. Both themes are composed, never inverted: dark is ink-black with teal-tinted panels; light is cool blue-grey paper with deep-sea accents.

Density is deliberate: a three-step section rhythm (up to 144px of vertical air at desktop for the Projects peak, 120px for standard chapters, 84px for annexes), a single reading column for articles, tight grouped cells inside `gap-px` plate-tables. The interface is fully bilingual (ES default, EN chrome) and both art-directed themes swap every raster (identity plate, project covers, blog schematics) through a `theme` preference.

**Key Characteristics:**

- Square, hairline-bordered plates; pills only for actions.
- Mono uppercase micro-labels with a trailing hairline rule above every headline.
- Fraunces is the seal (hero name, monogram, quotes); Space Grotesk speaks for headings; Inter carries reading; JetBrains Mono labels instruments.
- Registry cyan means _alive_: links, focus, selection, current state. Never applied to static decoration.
- Zero warm hues in the site's own chrome and illustrations except `alert-rose` for errors; technology brand colors on stack-tile hover/focus are a deliberate exception.
- Tonal elevation + 1px hairlines instead of shadow stacks; glow is reserved for the primary CTA.
- One authored entrance (hero rise, staggered 50ms) that is rehearsed when the visitor returns to the top after a quiet absence, plus the identity plate's calibration: a full misregistration burst followed by a single quick echo on first view, and only the short echo when the hero is revisited. Chapter headers draw their rule once and stay settled. The Experience record traces one continuous trajectory from station to station, and the first featured project cover makes a registration pass; these re-arm only after being fully out of view, so the file re-registers on return instead of replaying a generic scroll fade. Animated cascades are reserved for those peaks; annexes and inventories settle as static, well-composed plates.

## Colors

The palette is a cold instrument scheme: near-black grounds, teal-tinted mid surfaces, ink-white text, and a cyan/aqua accent family inherited from Hyprland.

### Primary

- **Registry Cyan** (`{colors.registry-cyan}`): interactive ink — links, active nav underline, focus ring, `::selection`, availability dot, hover borders, TOC current rail. The only color that says "you can touch this."
- **Signal Blue** (`{colors.signal-blue}`): action fill; owns the 105° gradient of `btn-primary` (blue → Telemetry Aqua) and the reading-progress rail.

### Secondary

- **Telemetry Aqua** (`{colors.telemetry-aqua}`): the warm half of every action gradient; also the "status ok" dot and core-stack highlight.
- **Ion Cyan** (`{colors.ion-cyan}`): inline `<code>` text on sunken chips inside article prose.

### Tertiary

- **Layer Ramp** (`--c-layer-1`…`--c-layer-4`): reserved for the `LayerPlate` onion and its selected-layer label (data → backend → API → interface). Dark keeps aqua, blue, Deep Sky and Interface Violet; light uses darker paper-safe variants while staying within the same hue path. Violet appears nowhere else — it is the ramp's endpoint, not a free accent.

### Neutral

- **Canvas / Surface / Sunken / Panel / Panel Raised** (`{colors.canvas}`…`{colors.panel-raised}`): five-step dark ground; panels are consumed at 10–35% alpha over sections, never as flat opaque cards.
- **Hairline / Hairline Strong** (`{colors.hairline}`, `{colors.hairline-strong}`): 1px structure everywhere — section borders, cell separators, card outlines. Strong is reserved for hover and emphasized strokes.
- **Ink / Muted / Glyph** (`{colors.ink}`, `{colors.muted}`, `{colors.glyph}`): text roles. Muted is body-secondary and must clear 4.5:1 on its actual surface.
- **On Action** (`{colors.on-action}`): text on gradient buttons.
- **Alert Rose** (`{colors.alert-rose}`): error border + message only.

### The Light Remap (composed, not inverted)

Light theme re-derives every role: canvas becomes cool paper, ink flips to near-black teal, and accents darken to sea depths so they keep ≥4.5:1 on paper. Canonical light values live in `src/assets/main.css` (`:root[data-theme='light']`); never introduce a color that exists in only one theme. Stack-tile brand colors are the one component that carries both theme values inline (`--tech-color-dark` / `--tech-color-light`) because the tiles are server-rendered.

### Named Rules

**The Registry Cyan Rule.** In interface chrome, cyan primarily marks the living state of the system — hover, focus, current, selected. A few fixed proof points and chapter markers can carry it too, provided they have a distinct non-link silhouette and the surrounding metadata stays neutral. The cyan/aqua halftone in the NSB and SL identity artwork is a deliberate signature, not a UI affordance. Stack-tile hover/focus colors are technology-specific brand identifiers, not general-purpose accents.
**The Zero-Warm Rule.** No orange, amber, yellow or warm red appears in the site's own chrome, art, or illustration. Alert Rose marks failure; technology-specific brand colors on stack-tile hover/focus are the only other exception and stay confined to those tiles.

## Typography

**Display Font:** Fraunces Variable (with Georgia fallback)
**Body Font:** Inter Variable (with system-ui fallback)
**Label/Mono Font:** JetBrains Mono Variable
**Heading Font:** Space Grotesk Variable (with Inter fallback)
**Seal Font:** Noto Serif JP, self-hosted and subset to 構 設 計 (with Mincho fallbacks)

**Character:** A didone-flavored serif signs the document, a grotesque announces its sections, a humanist sans lets you read it, a mono stamps every label, and a Mincho carries the two kanji. The voices never trade jobs.

### Hierarchy

- **Display** (Fraunces 900, 44→92px across md/xl, line-height 1.02, tracking -0.035em): the hero name and nothing else. Also the SL monogram at 24–26px in header/footer.
- **Headline** (Space Grotesk 700, 30→46px section titles; 34→54px article H1, lh 1.05–1.08, tracking -0.025 to -0.03em): every section and page title.
- **Title** (Space Grotesk 600, 17–24px, lh 1.15–1.35): card titles, article H2/H3 (23→27px bold for H2).
- **Body** (Inter 400, base 16px; prose 15.5–16.5px at lh 1.75–1.8; card copy 13–15px at lh 1.6–1.7): reading surfaces capped at ~72ch.
- **Label** (JetBrains Mono 500, 10–11.5px, uppercase, tracking 0.06–0.22em): eyebrows, meta rows, chips, badges, form labels, footer mono lines. `.mono-label` = 11px / 0.14em.
- **Seal** (Noto Serif JP 500, 13–46px; only 零 一 二 三 四 五 六 七 八 九 十 構 設 計, with compound numerals stacked vertically): the section indices, the dossier's stamps. `.seal-glyph` scopes the face; its unicode-range leaves any Latin beside it untouched.

### Named Rules

**The Instrument-Label Rule.** Mono is for labels, data and measurement — never for prose, never sentence case in chrome.
**The Serif-Is-The-Seal Rule.** Fraunces signs the identity (hero name, monogram, article quotes with `italic`). Section titles never borrow it; the seal and the loudspeaker are different voices.
**The Seal-Carries-Its-Own-Voice Rule.** The numerals and 構/設計 are set only in the sealed Mincho subset. They never appear in Fraunces, the grotesque or the mono, and no other language's glyphs enter the seal face; the Latin beside a seal keeps its own family.
**The Numbered-By-Seal Rule.** Sections are filed 零 through 十一 (hero 0, contact 11), each numeral stamped inside a hairline square beside its mono label — never an arabic number. Compound numerals stack vertically inside the same square so the seal still reads as one impression. Plate ids (PLACA 00 / 01) stay latin: they are instrument serials, not chapter indices.

## Layout

The page runs on a single centered shell: max-width **1440px**, inline gutters **24px → 56px (md) → 120px (xl)**. Vertical rhythm is a hierarchy rather than a constant: `.section-pad-lg` (64 → 96 → 144px) for the Projects peak, `.section-pad` (56 → 76 → 120px) for standard chapters, and `.section-pad-sm` (44 → 60 → 84px) for the Stack inventory and the Education/Certifications annex. Sections alternate grounds between canvas and surface, separated by a 1px hairline — the file's page breaks. Section headers carry a `density` (`feature`, `default`, `compact`) so the opening scale and gap match the chapter's role without losing the seal-and-rule signature.

Asymmetry is structural, not decorative: the first featured project runs a wider `1.15fr / 0.85fr` media/copy grid as the section's lead case, the following featured projects alternate media/copy in an `0.8fr / 1.2fr` grid and swap sides per index; the skills plate leads with the layer diagram, then the capability matrix; articles run one centered column with a 210px sticky TOC from 1280px. Grouped data (layer cells, role cells) uses **`gap-px` on a hairline background** so separators and cells share one pixel — a plate-table, not a card row.

Mobile: single column everywhere; nav collapses into a full-height drawer (`100dvh` minus the header height) with display-size links and the locale/theme controls pinned at its end, dropping to a 64px header and compact links in short landscape; carousels become edge-to-edge with snap and negative-margin bleed (`-mx-6 / px-6`). Text scaling, 320px and 4K are supported without horizontal overflow. Sticky-header anchor offsets are 112px (base) and 144px (xl): the header bar plus 24px of breathing room.

## Motion

The dossier registers; it does not fade section by section. The opening authored moment is the hero plate's calibration — a full misregistration burst followed by a single quick echo on first view, then only the short echo when the hero is returned to after a quiet absence. Chapter headers draw their trailing rule once and stay settled, with label, title and lead offset by 70/130ms. Everything else is feedback bound to a state or an explicit action. Motion is budgeted: the hero, the Experience trajectory and the first Project cover are the authored peaks; inventories and annexes below them keep short, staggered entrances that register their cells without competing with those peaks.

**The Quiet-Absence Rule.** Hero motion and the Experience rail are repeatable, but only after the element has been fully out of view for 2.4s. The identity plate waits 4.8s before its shorter echo. A quick scroll-by, a rubber-band bounce or a short trip to another section leaves the element settled; coming back much later re-arms it. Content is visible by default, never hidden while on screen, and re-arming happens offscreen so the next entry starts from zero without a visible flash. Chapter headers opt out of the cycle: they register once, so a return visit finds the file already open instead of replaying every chapter.

- Hero copy rises in a 50ms stagger on load and replays that same stagger when the top is re-entered after a quiet absence. The availability ping runs three times per entrance.
- About completes only its title's lead/tail reading cascade; the name, paragraphs, actions, fact table and role register settle with the section instead of animating in separate waves. This is the one place where the block-level cascade is deliberately retired.
- Skills leads with the layer plate. Selecting a layer is the authored interaction; the capability matrix below registers when its grid reaches the viewport — opacity plus a 10px rise, staggered 50ms and capped at 250ms.
- The service register is composed as a hierarchy — one dominant lead cell, two secondary cells, four compact complements — and its cells register in reading order with a 55ms stagger capped at 220ms.
- **The Trajectory.** Experience is one continuous journey rather than a stack of separate entries. A hairline rail runs through the whole record; each entry's segment fills cyan-to-aqua as the rail reaches its station, the dot emits one ring, and a short branch registers the role into the reading column. The reading column follows as a 60→260ms cascade over period, role, summary, bullets, stack and relations. Desktop gives the rail its own 1px column between the period and the content; mobile keeps a narrower left-edge rail so the route survives the single-column layout. The segment holds while the entry is on screen and re-arms with the rest of the record after a quiet absence.
- Stack settles group by group: each group's serial and heading lead, then its tiles follow in 35ms steps capped at 175ms. Groups below the fold wait for their own entry instead of joining one long cascade.
- Education and Certifications are one annex: compact ledger rows with a shared left metadata column. Each row draws its cyan-to-aqua hairline across the top of the record and raises its content in 55–70ms steps, so the annex still registers without the height or the card weight it used to carry.
- Blog is an editorial composition: one leading article with its cover, then two compact reading rows. Each card still draws its short registration line along the top edge and arrives with a 70ms stagger; the composition changed, the registration did not.
- The first featured project cover makes one registration pass: two hairlines draw along its inner top and bottom edges in opposite directions, then fade. Its copy completes the entry as a 55ms-step cascade from badges to actions, and the first case takes a wider grid and larger title than the following cases. It re-arms after a quiet absence; the hover/focus scan remains a separate, repeatable affordance.
- Project filters reorder with FLIP: cards that remain slide to their new cells, entering cards arrive with a 34ms stagger capped at five steps, and leaving cards fade in 140ms. Focus and reading order stay in the live grid.
- Project media trace a 1px cyan-to-aqua registration line on hover or keyboard focus.
- Revealing the remaining testimonials enters the new cards with opacity plus a 12px rise, staggered 60ms across at most four steps. Collapsing is immediate, and keyboard focus stays on the toggle.
- The review access and panel surfaces are tools, not chapters: no entrance choreography. The panel preview updates instantly, publishing shows one short opacity/translate confirmation under `prefers-reduced-motion: no-preference`, and the home invitation plate stays static.
- Copying the email draws one short confirmation hairline under the email row, then settles the copy icon into its check and the live status. The contact form has no submission state while no receiver is configured: the submit control rests disabled and no success message is shown.
- `LayerPlate` animates only the selected ring's orbit and connectors; selecting a layer adds one shockwave after the explicit choice.
- The article progress rail uses `scaleX` on a fixed element, never `width`.
- Anchor navigation, including the logo's return to the top, runs through one smooth scroll that leaves a 24px gap under the sticky header. The header's scroll spy holds its background hash rewrite while that journey runs, so a click is never superseded by the section being left. Reduced motion replaces the journey with an instant arrival.
- Motion uses transform, opacity or `scale`, pauses offscreen, and falls back to static state changes under `prefers-reduced-motion`.

**Astro note.** The page is server-rendered. Sections that do not need client state run their entrances through `src/scripts/reveal.ts`, which applies the same `is-armed` / `is-shown` / `is-traced` classes as the Vue composables; hydrated islands keep `useRevealCycle`. Both paths use the same 2.4s quiet-absence rule, and the script arms only targets that are fully offscreen so server-rendered content never flashes. Chapter headers use the one-shot variant (`once`) in both paths. Hero and IdentityPlate are hydrated (`client:load`) because their calibration is stateful.

## Elevation & Depth

The system is **flat by default**. Depth is carried by the five-step tonal ground (canvas → panel-raised), 1px hairlines, and alpha-layered panels (`bg-panel/10…35`). Shadows exist only as state or identity signals:

### Shadow Vocabulary

- **CTA Glow** (`box-shadow: 0 12px 32px -18px color-mix(in srgb, {colors.signal-blue} 55%, transparent)`; light theme replaces it with a neutral `0 10px 26px -16px rgb(7 20 26 / 32%)`): primary buttons only.
- **Tile Lift** (`0 14px 30px -24px {colors.registry-cyan}` under a `-translate-y-0.5` hover): stack tiles.
- **Backdrop Blur**: header at rest/scroll (`backdrop-blur-md` + `bg-page/75→/92`) and contact card (`bg-page/80` + `backdrop-blur-sm`) — function is legibility over scrolling content, never frost.

### Named Rules

**The Hairline-Does-The-Work Rule.** If a shadow is separating two regions, you forgot a 1px border.

## Shapes

Corners are square (`{rounded.plate}` = 0px) on every plate, card, figure, and code surface — the dossier silhouette. The only exceptions: action pills (`9999px`), fields and code blocks (`{rounded.sm}` 8px), inline code (`3px`), chips (`{rounded.xs}` 4px).

`PlateFrame` defines the signature silhouette: a 1px `{colors.hairline}` border plus four L-shaped corner ticks (`line-strong`, 3.5 units) sitting on the corners like registration marks. Identity and cover art (PNG/SVG rasters, theme-swapped, always with explicit `width`/`height` to prevent shift) continue the same geometry: dot matrices, orbital nodes, ruler ticks. Hover states brighten strokes (border → cyan at 45–100%), they never change shape.

**Dot-field hierarchy:** `--dot-grid` (16px) ties every field to the same stamped grid, and one reach model (`--dot-field-height`, `--dot-field-strength`, `--dot-field-reach`, `--dot-field-focus`) governs all of them. `dot-field` is the chapter-opening field: a top-right patch that fades before the reading column. `.dot-field--lead` opens the visitor with a wider field over the whole hero, ending before the identity plate; `.dot-field--peak` steps Projects up once more; `.dot-field--quiet` keeps Experience and Testimonials at annex scale; `.dot-field--mark` is the compact chapter mark for Stack and Education, whose content starts early; `.dot-field--echo` adds a closing band in the chapter's bottom air, mirroring the opening without crossing the reading column. **The body field** (`dot-field--body` + `dot-extra`) releases the same dots again through the chapter: one or two soft radial patches placed at different heights and alternating sides, so the motif is dispersed instead of stacked at the edges. It sits behind the plates and reading columns (`z-index: -1` inside an isolated section) and adds no height, so it surfaces in the air around the content and never tints copy. Contact mirrors the field on the left, away from the form. Intensity is `--dot-field-strength` scaled by `--dot-field-weight` (`1` in ink, `0.85` on paper) so both themes print the same amount of pigment. Fields keep a smaller, softer presence on mobile instead of disappearing. `dot-surface` carries the same grid at plate scale (About plate, project media, blog cover), `dot-corner` marks the first stack tile, and every chapter header carries the short dot rule (`section-marker`); selected chapters brighten it with `section-signal` while quieter chapters keep it neutral. The NSB/SL monograms keep their denser cyan halftone. Never raise a field to full strength behind body copy or repeat it on every card.

## Components

### Buttons

- **Shape:** fully round pills (9999px), min-height 52px, horizontal padding 28px, 15px/600 Inter.
- **Primary** (`button-primary`): 105° linear gradient Signal Blue → Telemetry Aqua, text On Action, CTA Glow. Hover: `brightness(1.06)` + `translateY(-1px)`; active returns to rest. 180ms ease on all state transitions.
- **Ghost** (`button-ghost`): 1px Hairline Strong border, Registry Cyan text, transparent fill. Hover: border turns cyan and a 7% cyan wash fills the pill.
- **Filter pill** (`filter-pill`): mono 10.5px uppercase, hairline border; pressed state fills `soft/10` with cyan border and cyan text plus `aria-pressed`.
- **Layer tab:** square plate-table cell with a 10px mono index, 15→16px title and 10px responsibility line. The selected cell uses Panel at 60% plus Registry Cyan markers and `aria-selected`; the rest use Muted. Arrow keys, Home and End move between the four layers.

### Chips

`tech-chip`: 1px hairline border, 4px radius, mono 10.5px uppercase 0.08em, Muted text (or Registry Cyan at 90% for `tone="soft"`). Overflow groups show a `+N` chip. A `plain` variant replaces the border with a 1px cyan dot prefix.

### Cards / Containers

- **Corner Style:** square, always.
- **Background:** Panel at 10–25% over the section ground (`bg-panel/10…25`).
- **Border:** 1px Hairline; hover promotes toward Hairline Strong or cyan (never thicker than 1px).
- **Internal Padding:** 20 → 28px (p-5 → p-7); card footers are separated by an internal hairline, not by spacing alone.
- Plate-tables (`gap-px` on Hairline background) replace card grids for enumerable data.

### Inputs / Fields

`field`: Sunken ground, 1px Hairline border, 8px radius, 14px text, Muted placeholders at full opacity. Hover darkens the border; focus shifts the border to Registry Cyan with a 2px offset outline. Error: Alert Rose border + 12px rose message wired via `aria-invalid`/`aria-describedby`, and focus jumps to the first invalid control on submit.

### Navigation

- **Header:** sticky, 88px (120px at xl), backdrop-blur; hairline appears only once scrolled. Mono 11.5px uppercase links; current section gets cyan text + a 1px underline that scales in from the left. Attraction detail: the "SL" serif seal shifts to cyan on hover.
- **Mobile drawer:** full-height, display-size 22px links over hairlines, `focus` trapped inside, Escape closes and returns focus to the 44px trigger.
- **Article wayfinding:** a 2px fixed reading-progress rail (blue → aqua gradient) and a sticky TOC whose current item earns a cyan left-rail.

### Signature Components

- **Identity Plate** (`IdentityPlate.vue` / `IdentityPlateSheet.vue`): the hero's live SVG schematic sheet, with bilingual `alt` and theme-composed paint tokens. Its foot carries the 設計 blind stamp — the seal struck inside its own hairline box in `--plate-seal`, so it reads as an impression on the sheet rather than a badge. Shortly after it appears it calibrates: a 640ms full misregistration burst, then a single 360ms, half-amplitude quick echo, then the sheet holds still; a return after a quiet absence replays only the quick echo. Its register groups jolt in opposite directions while two negative impressions — light-on-dark in the dark theme, deep-ink-on-light in the light theme — tear across the sheet in scan bands and snap back to zero. The ghosts are `aria-hidden`, use unique paint-server ids, and never run offscreen, in a hidden tab, or under reduced motion.
- **PlateFrame:** hairline + corner registration ticks (see Shapes).
- **SealEyebrow** (`ui/SealEyebrow.vue`): the chapter index — a kanji numeral in a `1.85em` hairline square, a `//`, then the mono label. The numeral and slash are `aria-hidden`; the label is the accessible name. Used by `SectionHeader` and by the page headers on Projects and Blog.
- **LayerPlate:** concentric onion of the four application layers, data at the core. Only the selected layer keeps a live orbit and flowing connectors; the other rings hold position, and the whole plate pauses offscreen. Selected-layer feedback is a slightly larger ring, brighter stroke and one shockwave pulse after an explicit user choice. The SVG is decorative (`aria-hidden`) and cannot be clicked; a four-tab roving control (`role="tablist"`, arrows/Home/End, `aria-selected`) owns selection. On `lg` the 340px detail panel sits beside the fixed `680/450` plate and the tabs span below; on smaller screens the source order stays plate → tabs → detail. The accessible `--c-layer-*` ramp is its exclusive home; the detail's index row borrows the selected color. Reduced motion stops the ambient loops, applies the selected ring state instantly, and preserves opacity/color feedback without movement.
- **Project evidence strip** (`ProjectRelations.vue`): one inline `VÍNCULOS / LINKS` strip per project. Experience links carry the organisation and an upward arrow; review links carry a 20px portrait, first name and a downward arrow to the review anchor. It replaces stacked relation boxes on cards; the full name and author role live in the link's accessible name.
- **Project code disclosure:** a native `<details>` row labelled `CÓDIGO` keeps the snippet closed by default. The summary carries the chevron and swaps `Ver fragmento` for `Ocultar fragmento`; the open state reveals a bare `CodeBlock` inside the same plate, never a second nested card. A `demo` action renders only when a project has a real public URL.
- **Service register** (`ServicesSection.vue`): a `gap-px` plate-table filed as `二 // SERVICIOS`. The lead service runs full width as a two-column spread — title left, description and scope right — and websites and mobile applications sit side by side below it. Four compact complementary services follow in one register row of hairline-separated cells. Each cell carries an `SRV` serial and plain-language, client-focused copy without case or experience links. The register closes with one primary action into contact.
- **CodeBlock:** Panel-Raised figure at 8px radius with three terminal dots (Muted at 45/30/20%), scrollable mono pre capped at 420px, thematically colored scrollbar. Pass `bare` when it sits inside an existing plate.
- **Review registry access** (`ReviewAccess.vue`): a "reader registration desk" inside the dossier. A narrow protocol column with mono `01/02/03` steps sits beside a `PlateFrame` access card. The card carries `ACCESO · GOOGLE`, `Cuéntame tu experiencia.`, `Solo toma un minuto.`, and a 52px hairline pill with the monochrome Google mark and `Continuar con Google`. The control stays disabled with `Preparando acceso…` until the Firebase SDK is ready. Errors use Alert Rose and `role="alert"`; the page has no entrance choreography.
- **Review panel** (`ReviewPanel.vue`): an Operate surface built as one register plate with `01 CONTEXTO / 02 LO QUE QUIERES CONTAR / 03 ENVIAR` sections divided by hairlines. The form column pairs with a sticky preview column (`VISTA PREVIA`) that renders the exact home `ReviewCard` in non-interactive mode and carries a neutral `EN REVISIÓN` stamp. The preview is sticky from `lg`; mobile places it after the form with a mono jump link. The review language is inherited silently from the portfolio locale; there is no language selector. A send failure appears next to the `Enviar a revisión` button, receives focus and offers retry/contact instead of hiding above the form. On success the form is replaced by a status plate and a read-only card; focus moves to the status heading.
- **Review card** (`ReviewCard.vue`): the home testimonial card, extracted for reuse. Square plate, 48px round `Avatar` with Google photo and initials fallback, full name, a hairline Google badge (monochrome Google G + `Google`), a visible `mailto:` email link with a mail glyph, roles, serif quote and relation links. The hairline-only visual language is unchanged; the preview renders relation items as spans without arrows so the draft cannot navigate away. The first approved review can take a wider lead plate (`featured`) with a larger quote and a `72ch` measure; a lone review centers at 980px, and a closing odd review spans the row so the comparison grid stays balanced.
- **Review invite** (`ReviewInvite.vue`): a hairline-separated footer plate after the review list, or the empty-state plate when no review is approved. Mono eyebrow, display question, one ghost pill `Dejar una reseña`; it is present in the server HTML and needs no JavaScript.

## Do's and Don'ts

### Do:

- **Do** take every color from the `--c-*` token pairs in `src/assets/main.css` and verify the pair's contrast on its actual surface (≥4.5:1 body, ≥3:1 large/UI) in **both** themes.
- **Do** keep each interactive element's identity in Registry Cyan and treat Hairline/`gap-px` as the default grouping mechanism.
- **Do** swap every raster with the `theme` preference (`*_dark` / `*_light`), set explicit `width`/`height`, and give plates a bilingual `alt`.
- **Do** label sections with the mono eyebrow + trailing rule pattern; let the hero's staggered rise and the plate's calibration own the entrance, and let chapter headers draw their rule once and stay settled rather than fading every block into view.
- **Do** finish a section entrance within roughly 1.4 seconds: header, then the content; anything further down waits for its own entry instead of joining one long choreography. Give every register, grid and record row its staggered registration; reserve the long cascades (60–315ms ladders) for the hero, Experience and the first Project cover.
- **Do** provide a `prefers-reduced-motion` path that keeps state changes legible (opacity/color yes; movement no).
- **Do** name actions honestly: the contact form says _Send message_ and keeps its submit control disabled until a receiver exists; confirmations never claim unverified success.
- **Do** use `UiIcon` (Lucide-backed, single stroke, 1.6 weight) for every UI glyph. Brand and technology marks come from Simple Icons at build, except custom marks declared with `customIcon` and served from R2 as a mask; the identity artwork stays bespoke.
- **Do** keep the section numerals and 構/設計 in `--font-seal`, and explain the two words once in the About plate's seal legend; a stamp with no reading is decoration.

### Don't:

- **Don't** use gradient text, glass surfaces without a legibility job, or the CTA gradient as a decorative fill.
- **Don't** round corners beyond the scale (pills / 8px / 4px / 3px); no soft-card silhouettes from generic component kits.
- **Don't** introduce warm hues (orange, amber, yellow, warm red) into site chrome or illustration — Alert Rose means failure. Preserve the original technology brand colors on stack-tile hover/focus as the sole non-error exception.
- **Don't** scatter colored glows; in the light theme, shadows are neutral.
- **Don't** use Interface Violet outside the LayerPlate ramp, and never recolor tokens per-page.
- **Don't** fake product imagery: private systems keep schematic plates, never mock screenshots.
- **Don't** stack shadows for depth, swap the four-voice font system, or restyle the seal glyphs (構, 設計) as decoration.
- **Don't** inline a new `<svg>` icon in a component; add the Lucide name to `icon-names.ts` and both `UiIcon` maps instead. The identity/layer plates, the NSB/SL monograms and the favicon are artwork, not icons, and are exempt.
- **Don't** import the server-only technology icon resolver from a client component, and don't inline raw custom SVG; custom marks are R2 SVGs rendered as a mask.
