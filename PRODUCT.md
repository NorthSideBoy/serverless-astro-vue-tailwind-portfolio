# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences carry equal weight:

- **Recruiters and technical hiring teams.** They evaluate whether Said fits a backend or full-stack role. They scan experience, stack, production evidence and code, then download the CV or start a conversation.
- **Potential clients.** They arrive with a system to build, repair or maintain and need to judge delivery capability, communication and fit. They read the project record, check public products where possible and contact Said.

Both audiences expect a professional portfolio that is quick to scan on mobile and credible enough to act on. Technical peers and readers of the blog also use the writing; no separate audience priority has been confirmed.

## Product Purpose

A personal portfolio for Said Lucena (NorthSideBoy), a backend-leaning full-stack developer based in Caracas, Venezuela. It presents his identity, services, skills, work experience, selected projects, project code excerpts, technical writing, reviews and contact channels.

The primary success action is **direct contact by email or WhatsApp**, whether for a job opportunity or a project inquiry. Downloading the CV and exploring projects or repositories support that action. The portfolio exists to turn professional interest into a conversation, not to operate as a product itself.

## Positioning

The portfolio is a working engineering record, not a service brochure. Each project is presented with its workplace context, role, stack, code excerpt, repository names and public link where one exists. The claim is not simply "I can code"; it is "here is the work, the constraints it shipped under, and the evidence that connects it to my experience."

The same record connects projects, experiences and reviews through stable references, so a visitor can move from a system to the job that produced it and to the people who experienced the result.

## Operating Context

- Personal site maintained as an Astro application with Vue islands, not a company or SaaS product.
- Content is validated against typed schemas in `src/data/` and loaded from Firestore during the static build; there is no confirmed CMS or editorial team.
- Spanish-first product with an English interface and English versions of substantive content.
- Public routes: a single-page home with anchored sections, `/proyectos`, `/blog` and `/blog/:slug`. Visitor review routes `/resenas/` and `/resenas/panel/` are interactive, `noindex` utility pages, not public content.
- The home file follows the order: hero, key figures, about, services, skills, stack, experience, projects, education, certifications, blog, reviews and contact.
- The contact form collects name, email, subject and message in the browser. No receiver is configured, so the submit control is disabled; visitors reach Said through the email, WhatsApp and GitHub links beside it.
- The CV is downloadable in Spanish at `/cv/said-lucena-cv.pdf`.
- Dark and light themes and the ES/EN preference are persisted between visits. Locale changes are URL-based (`/en/...`) in the Astro build and keep the current section fragment.
- The professional context is Caracas, Venezuela (UTC−4), with remote or local availability. The site currently declares availability for projects and job opportunities.

## Capabilities and Constraints

- Project records support one or more repositories, external links and an optional `demo` URL. A demo action renders only when a real public URL exists.
- Projects are related to experiences and reviews by stable identifiers; relation helpers power both directions of navigation.
- Private systems must never be represented with fabricated screenshots or invented demos. Schematic art, code excerpts and repository names are the honest substitute.
- SIPCAs and Colegio Simón Bolívar are private production systems. Public demo URLs for both are **undecided and not yet supplied**.
- The MVC boilerplate is public on GitHub. Orinoco.io has a public product link and Cuantía.io a public Google Play listing.
- Reviews are stored as testimonials from clients and collaborators, with an author profile, roles and quote. Visitors can now sign in with Google, write, preview and submit a review linked to an experience or project. Submitted reviews start unapproved and are published only after moderation.
- Review author emails are shown with approved reviews. The Firestore document remains owner-read only, but the static build publishes the email in the review card for direct contact. Visitor emails are therefore public, not moderation-only.
- The only confirmed CV is the Spanish PDF. An English CV is not confirmed.
- No analytics, newsletter or server-side contact handling are present. Google-authenticated visitor reviews are the only user-account surface. None of the other absent capabilities should be implied.
- No formal accessibility standard was recorded. The incumbent implementation includes keyboard navigation, visible focus, reduced-motion handling and both-theme contrast; future work should preserve those affordances.

## Brand Commitments

- Identity: **NorthSideBoy** as the familiar identity and **Said Lucena** as the professional name.
- Voice: first person, technical, direct and low-hype. It explains decisions, constraints and tradeoffs rather than relying on superlatives.
- Spanish is the primary language; English mirrors the interface and content instead of being a partial translation layer.
- Honesty about evidence: do not invent demos, screenshots, metrics, clients or endorsements.

## Evidence on Hand

- **Experience records** with organisation, role, period, location and outcomes:
  - Colegio Simón Bolívar — Backend Lead, July 2026–present.
  - SIPCAs — Full Stack Developer, April 2026–present.
  - H2D.dev — Backend Developer, April 2023–May 2024.
  - OrinocoDev — Full Stack Developer, June 2022–April 2023; Developer Intern, April–June 2022.
- **Project records**:
  - Colegio Simón Bolívar: private administrative, academic and financial management system; Node, TypeScript, MongoDB, Vue 3 and Quasar; two repository names and a code excerpt; no public demo yet.
  - SIPCAs: private academic and operations ERP; Node, TypeScript, MongoDB, Vue 3 and Quasar; two repository names and a code excerpt; no public demo yet.
  - MVC Boilerplate: public GitHub repository, code excerpt and documented public link.
  - Orinoco.io: public product link and contribution record inside OrinocoDev.
  - Cuantía.io: public Google Play listing and contribution record inside OrinocoDev.
- **Technical writing**: published articles loaded from Firestore during the build, with dated publication entries and cited sources.
- **CV**: Spanish PDF available at `/cv/said-lucena-cv.pdf`; it is the only confirmed CV asset.
- **Identity and project artwork**: generated schematic plates, not screenshots of private products.
- **Reviews**: moderated testimonials from clients and collaborators, with an author profile, roles, quote and optional links to the projects and experiences they refer to. The published card shows the author's email as a `mailto:` link and a Google account badge. Visitor submissions remain pending until approved.

## Product Principles

1. **Lead with the working record.** Every claim should point to a project, an experience, a code excerpt, a repository or a public product. When evidence does not exist, say so rather than filling the gap.
2. **Two audiences, one conversation.** Recruiters and clients should both find enough proof to act without the site splitting into two competing narratives.
3. **Make contact one step away.** Every project, experience and article should leave a clear path to the contact action without interrupting the reading experience.
4. **Label the provenance.** Private work and generated artwork must be identifiable for what they are.
5. **Moderate before publishing.** A review is visible only after explicit approval; never present a pending or self-approved submission as a testimonial.
6. **Keep the record maintainable.** Durable facts belong in typed data modules with stable identifiers; presentation changes should not require rewriting the professional record.

## Accessibility & Inclusion

No formal accessibility standard has been confirmed. The existing product supports Spanish and English, keyboard navigation, visible focus, reduced-motion preferences and composed dark and light themes. Future work should preserve these capabilities and verify contrast and focus in both themes.
