import type { ContentGraph } from '@/data/schemas/graph'
import { validateContentGraph } from '@/data/schemas/graph'
import { parseCollection } from '@/data/schemas/registry'
import {
  toArticle, toCertification, toEducation, toExperience, toProject, toPublicTestimonial, toSiteSections,
} from '@/data/mappers'

/**
 * Test-only content. It exercises every renderer without reading Firestore.
 * Production builds keep using loadContent(); set CONTENT_SOURCE=fixture only
 * for local visual and browser tests.
 */
const localized = (value: string) => ({ es: value, en: value })
const section = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  copy: {
    es: { eyebrow: id.toUpperCase(), title: id, lead: `Contenido de prueba: ${id}`, ...extra },
    en: { eyebrow: id.toUpperCase(), title: id, lead: `Fixture content: ${id}`, ...extra },
  },
})

export const fixtureDocuments = {
  siteSections: [
    section('stack', { note: 'Fixture stack note' }),
    section('experience'),
    section('projects', { moreEyebrow: 'MÁS', moreTitle: 'Más proyectos', moreLead: 'Fixture more', index: { title: 'Proyectos', lead: 'Fixture projects', meta: { title: 'Proyectos', description: 'Fixture projects' } } }),
    section('education'),
    section('certifications'),
    section('blog', { index: { title: 'Blog', lead: 'Fixture blog', meta: { title: 'Blog', description: 'Fixture blog' } } }),
    section('reviews'),
  ],
  authors: [{
    id: 'fixture-author', name: 'Fixture Author', initials: 'FA',
    note: localized('Autor de prueba'), cta: { href: '/', label: localized('Inicio') },
  }],
  stackGroups: [{ id: 'backend', order: 0, name: localized('Backend'), description: localized('Grupo de prueba') }],
  technologies: [
    { id: 'typescript', name: 'TypeScript', tag: localized('Lenguaje'), href: 'https://www.typescriptlang.org/', icon: 'typescript', hoverColor: { dark: '#3178c6', light: '#3178c6' }, core: true, stackGroupId: 'backend', order: 0, type: 'technology' },
    { id: 'astro', name: 'Astro', tag: localized('Framework'), href: 'https://astro.build/', icon: 'astro', hoverColor: { dark: '#ff5d01', light: '#ff5d01' }, core: true, stackGroupId: 'backend', order: 1, type: 'technology' },
  ],
  experience: [{
    id: 'fixture-role', order: 0, org: 'Fixture Org', role: 'Developer', highlight: true,
    location: localized('Remoto'), summary: localized('Resumen de prueba'),
    bullets: { es: ['Logro de prueba'], en: ['Fixture achievement'] },
    tech: [{ id: 'typescript' }], startMonth: '2024-01', endMonth: null,
  }],
  projects: [{
    id: 'mvc-boilerplate', order: 0, title: localized('Fixture Project'), summary: localized('Resumen del proyecto'),
    description: localized('Descripción del proyecto de prueba'), collaboration: false, featured: true,
    visibility: 'public', context: localized('Producto'), experienceIds: ['fixture-role'],
    role: localized('Developer'), period: localized('2024'), tech: [{ id: 'typescript' }, { id: 'astro' }],
    media: { type: 'monogram', label: 'FP' },
    links: [{ kind: 'code', href: 'https://github.com/NorthSideBoy/mvc-boilerplate', label: localized('Código'), primary: true }],
    code: 'const fixture = true', repos: ['NorthSideBoy/mvc-boilerplate'],
  }, {
    id: 'second-project', order: 1, title: localized('Second Fixture'), summary: localized('Segundo proyecto'),
    collaboration: true, featured: false, visibility: 'private', context: localized('Cliente'),
    experienceIds: [], tech: [{ id: 'typescript' }], media: { type: 'monogram', label: 'SF' }, links: [],
  }],
  education: [{
    id: 'fixture-education', order: 0, title: localized('Ingeniería'), institution: 'Fixture University',
    location: localized('Caracas'), description: localized('Formación de prueba'), startYear: 2018, endYear: 2023,
  }],
  certifications: [{
    id: 'fixture-cert', order: 0, title: 'Fixture Certification', provider: 'Fixture Provider',
    issuedMonth: '2024-01', href: 'https://example.com/certificate',
  }],
  articles: [{
    id: 'fixture-article', order: 0, status: 'published', publishedAt: '2024-01-01', updatedAt: '2024-01-02',
    cover: { src: '/images/fixture/cover.png', alt: localized('Portada de prueba'), width: 1200, height: 750 },
    authorId: 'fixture-author', featured: true,
    translations: {
      es: {
        title: 'Artículo de prueba', excerpt: 'Resumen del artículo de prueba', category: 'Pruebas',
        blocks: [
          { id: 'intro', type: 'heading', level: 2, segments: [{ type: 'text', text: 'Introducción' }] },
          { type: 'paragraph', segments: [{ type: 'text', text: 'Texto con ' }, { type: 'text', text: 'énfasis', marks: ['strong'] }, { type: 'text', text: ' y un ' }, { type: 'link', href: 'https://example.com', children: [{ type: 'text', text: 'enlace' }] }, { type: 'text', text: '.' }] },
          { type: 'callout', tone: 'note', title: 'Nota', segments: [{ type: 'text', text: 'Contenido de la nota.' }, { type: 'footnoteRef', id: 'note-1' }] },
          { type: 'quote', segments: [{ type: 'text', text: 'Una cita de prueba.' }], cite: { text: 'Fuente de prueba', href: 'https://example.com/source' } },
          { type: 'list', ordered: true, items: [{ segments: [{ type: 'text', text: 'Primer punto' }], children: [{ segments: [{ type: 'text', text: 'Punto anidado' }] }] }, { segments: [{ type: 'text', text: 'Segundo punto' }] }] },
          { type: 'code', lang: 'ts', label: 'Ejemplo', code: 'const fixture = true' },
          { type: 'image', src: '/images/fixture/body.png', alt: 'Imagen de prueba', caption: 'Pie de prueba' },
          { type: 'gallery', columns: 2, items: [{ src: '/images/fixture/gallery-a.png', alt: 'Galería A' }, { src: '/images/fixture/gallery-b.png', alt: 'Galería B' }] },
          { type: 'divider' },
          { type: 'table', caption: 'Tabla de prueba', head: { cells: [{ segments: [{ type: 'text', text: 'A' }] }, { segments: [{ type: 'text', text: 'B' }] }] }, rows: [{ cells: [{ segments: [{ type: 'text', text: '1' }] }, { segments: [{ type: 'text', text: '2' }] }] }] },
          { type: 'embed', provider: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Vídeo de prueba' },
          { type: 'file', src: '/files/fixture/doc.pdf', label: 'Documento de prueba', meta: 'PDF · 10 KB', download: true },
          { type: 'footnotes', items: [{ id: 'note-1', segments: [{ type: 'text', text: 'Nota al pie de prueba.' }] }] },
        ],
      },
      en: {
        title: 'Fixture article', excerpt: 'Fixture article excerpt', category: 'Testing',
        blocks: [
          { id: 'intro', type: 'heading', level: 2, segments: [{ type: 'text', text: 'Introduction' }] },
          { type: 'paragraph', segments: [{ type: 'text', text: 'Fixture paragraph.' }] },
        ],
      },
    },
  }, {
    id: 'solo-es', order: 1, status: 'published', publishedAt: '2024-02-01', updatedAt: '2024-02-02',
    cover: { src: '/images/fixture/cover.png', alt: localized('Portada de prueba'), width: 1200, height: 750 },
    authorId: 'fixture-author', featured: false,
    translations: {
      es: {
        title: 'Artículo solo en español', excerpt: 'Solo disponible en español', category: 'Pruebas',
        blocks: [
          { id: 'intro', type: 'heading', level: 2, segments: [{ type: 'text', text: 'Introducción' }] },
          { type: 'paragraph', segments: [{ type: 'text', text: 'Contenido solo en español.' }] },
        ],
      },
    },
  }, {
    id: 'solo-en', order: 2, status: 'published', publishedAt: '2024-03-01', updatedAt: '2024-03-02',
    cover: { src: '/images/fixture/cover.png', alt: localized('Fixture cover'), width: 1200, height: 750 },
    authorId: 'fixture-author', featured: false,
    translations: {
      en: {
        title: 'English only article', excerpt: 'Only available in English', category: 'Testing',
        blocks: [
          { id: 'intro', type: 'heading', level: 2, segments: [{ type: 'text', text: 'Introduction' }] },
          { type: 'paragraph', segments: [{ type: 'text', text: 'English-only content.' }] },
        ],
      },
    },
  }],
  reviews: [{
    id: 'fixture-review', order: 0,
    author: { provider: 'GitHub', firstName: 'Sample', lastName: 'Reviewer', email: 'sample@example.com', photo: '/images/fixture/avatar.png', roles: ['Developer'] },
    quote: 'Reseña de prueba', experienceIds: ['fixture-role'], projectSlugs: ['mvc-boilerplate'],
  }],
}

export function loadFixtureContent() {
  const graph: ContentGraph = {
    siteSections: parseCollection('siteSections', fixtureDocuments.siteSections),
    authors: parseCollection('authors', fixtureDocuments.authors),
    stackGroups: parseCollection('stackGroups', fixtureDocuments.stackGroups),
    technologies: parseCollection('technologies', fixtureDocuments.technologies),
    experience: parseCollection('experience', fixtureDocuments.experience),
    projects: parseCollection('projects', fixtureDocuments.projects),
    education: parseCollection('education', fixtureDocuments.education),
    certifications: parseCollection('certifications', fixtureDocuments.certifications),
    articles: parseCollection('articles', fixtureDocuments.articles),
    reviews: parseCollection('reviews', fixtureDocuments.reviews),
  }
  const issues = validateContentGraph(graph)
  if (issues.length) throw new Error(`Fixture content is invalid:\n${issues.join('\n')}`)
  const sort = <T extends { order: number }>(items: T[]) => [...items].sort((a, b) => a.order - b.order)
  return {
    sections: toSiteSections(graph.siteSections),
    groups: sort(graph.stackGroups),
    technologies: sort(graph.technologies),
    experience: sort(graph.experience).map((item) => toExperience(item, graph.technologies)),
    projects: sort(graph.projects).map((item) => toProject(item, graph.technologies)),
    education: sort(graph.education).map(toEducation),
    certifications: sort(graph.certifications).map(toCertification),
    articles: sort(graph.articles).filter((item) => item.status === 'published').map((item) => toArticle(item, graph.authors)),
    reviews: sort(graph.reviews).map(toPublicTestimonial),
  }
}
