export type Locale = 'es' | 'en'

interface NavLink {
  id: string
  label: string
}

interface Stat {
  value: string
  label: string
}

interface Fact {
  label: string
  value: string
}

interface Role {
  title: string
  description: string
}

interface SkillLayer {
  index: string
  label: string
  detail: string
  what: string
}

interface Skill {
  title: string
  description: string
  tags: string
}

export interface ServiceItem {
  index: string
  title: string
  description: string
  scope: string[]
}

export interface SiteContent {
  meta: { title: string; description: string }
  nav: {
    links: NavLink[]
    homeLabel: string
    navLabel: string
    openMenu: string
    closeMenu: string
    themeToDark: string
    themeToLight: string
    themeToggle: string
    languageLabel: string
  }
  hero: {
    eyebrow: string
    name: string
    role: string
    statement: string
    primary: string
    secondary: string
    availability: string
    imageAlt: string
  }
  stats: Stat[]
  about: {
    eyebrow: string
    title: string
    name: string
    lead: string
    paragraphs: string[]
    recordLabel: string
    facts: Fact[]
    rolesLabel: string
    roles: Role[]
  }
  services: {
    eyebrow: string
    title: string
    lead: string
    primaryLabel: string
    complementaryLabel: string
    complementaryNote: string
    primary: ServiceItem[]
    complementary: ServiceItem[]
    ctaQuestion: string
    ctaAction: string
  }
  skills: {
    eyebrow: string
    title: string
    lead: string
    layersLabel: string
    layersNote: string
    layersHint: string
    layersAction: string
    capabilitiesLabel: string
    capabilitiesNote: string
    layers: SkillLayer[]
    items: Skill[]
  }
  stack: {
    meta: {
      technologiesLabel: string
      areasLabel: string
      coreLabel: string
    }
  }
  experience: {
    cv: string
    reviewLabel: string
    reviewsLabel: string
    projectLabel: string
    projectsLabel: string
  }
  projects: {
    reviewLabel: string
    reviewsLabel: string
    experienceLabel: string
    experiencesLabel: string
    viewAll: string
    viewProject: string
    viewCase: string
    relationsLabel: string
    viewSnippet: string
    hideSnippet: string
    codeLabel: string
    privateCode: string
    privateLabel: string
    publicLabel: string
    collaborationLabel: string
    featuredLabel: string
  }
  projectsPage: {
    eyebrow: string
    back: string
    filterLabel: string
    filters: {
      all: string
      own: string
      collaborations: string
    }
    countLabel: string
    empty: string
  }
  certifications: {
    credentialLabel: string
  }
  blog: {
    minLabel: string
    readMore: string
    viewAll: string
  }
  blogPage: {
    eyebrow: string
    back: string
    countLabel: string
    featured: string
    highlighted: string
    readMore: string
    minLabel: string
  }
  articlePage: {
    back: string
    metaLabel: string
    authorLabel: string
    published: string
    updated: string
    readTime: string
    readTimeUnit: string
    toc: string
    navLabel: string
    prev: string
    next: string
    notFound: string
    notFoundHint: string
    backToBlog: string
    footnoteRef: string
    footnotesTitle: string
    backToReference: string
    galleryLabel: string
    tableLabel: string
    embedFallback: string
    unsupportedBlock: string
    calloutTones: {
      note: string
      tip: string
      warning: string
      important: string
    }
  }
  testimonials: {
    sampleNotice: string
    sampleBadge: string
    rolesLabel: string
    relatedProject: string
    relatedProjects: string
    relatedExperience: string
    relatedExperiences: string
    generalReview: string
    viewAll: string
    showLess: string
  }
  contact: {
    eyebrow: string
    title: string
    lead: string
    question: string
    paragraph: string
    badges: string[]
    emailAria: string
    whatsappAria: string
    githubAria: string
    form: {
      nameLabel: string
      namePlaceholder: string
      emailLabel: string
      emailPlaceholder: string
      subjectLabel: string
      subjectPlaceholder: string
      messageLabel: string
      messagePlaceholder: string
      submit: string
      copyEmail: string
      copied: string
      copyFailed: string
    }
  }
  footer: {
    tagline: string
    sectionsLabel: string
    contactLabel: string
    meta: string
    copyright: string
  }
  ui: {
    skipToContent: string
    opensInNewTab: string
    carouselPrev: string
    carouselNext: string
    loadingContent: string
    errorContent: string
    retryContent: string
    emptyContent: string
  }
}

export const content: Record<Locale, SiteContent> = {
  es: {
    meta: {
      title: 'NorthSideBoy (Said Lucena) — Desarrollador Full Stack con foco en backend',
      description:
        'Portfolio de NorthSideBoy, Said Lucena: desarrollo backend y full stack, sistemas en producción y proyectos desde Caracas, Venezuela.',
    },
    nav: {
      links: [
        { id: 'about', label: 'Sobre mí' },
        { id: 'services', label: 'Servicios' },
        { id: 'skills', label: 'Habilidades' },
        { id: 'stack', label: 'Stack' },
        { id: 'experience', label: 'Experiencia' },
        { id: 'projects', label: 'Proyectos' },
        { id: 'blog', label: 'Blog' },
        { id: 'contact', label: 'Contacto' },
      ],
      homeLabel: 'NorthSideBoy (Said Lucena) — inicio',
      navLabel: 'Navegación principal',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      themeToDark: 'Cambiar a tema oscuro',
      themeToLight: 'Cambiar a tema claro',
      themeToggle: 'Cambiar tema',
      languageLabel: 'Idioma',
    },
    hero: {
      eyebrow: 'DOSSIER',
      name: 'NorthSideBoy',
      role: 'BACKEND-LEANING FULL STACK DEVELOPER',
      statement: 'Crearé tu próxima solución tecnológica.',
      primary: 'Ver proyectos',
      secondary: 'Escríbeme',
      availability: 'Disponible para proyectos y oportunidades laborales · Caracas, VE (UTC−4)',
      imageAlt: 'Placa de identidad con las iniciales NSB en cian, retícula y marcas de registro',
    },
    stats: [
      { value: '04', label: 'años construyendo backend' },
      { value: '03', label: 'sistemas en producción' },
    ],
    about: {
      eyebrow: 'HOLA, SOY SAID',
      title: 'Hola, soy Said',
      name: 'Said Lucena',
      lead: 'Backend, arquitectura y datos.',
      paragraphs: [
        'Soy desarrollador full stack con foco en backend y más de cuatro años de experiencia. Diseño APIs y organizo la lógica de negocio para que el sistema sea fácil de entender, mantener y ampliar.',
        'Trabajo con bases de datos SQL y NoSQL, contenedores Docker y servidores Linux. He liderado proyectos y equipos de desarrollo, con atención a la calidad, las pruebas automatizadas y la revisión de código.',
        'Trabajo con equipos y clientes que necesitan construir un sistema, ordenar uno que ya existe o mantenerlo en producción. Me interesan los productos donde las decisiones de arquitectura tengan consecuencias reales y el software tenga que sostenerse en producción.',
      ],
      recordLabel: 'FICHA',
      facts: [
        { label: 'Ubicación', value: 'Caracas, Venezuela' },
        { label: 'Zona horaria', value: 'UTC−4 · VET' },
        { label: 'Enfoque', value: 'Backend · Arquitectura · Escalabilidad' },
        { label: 'Stack favorito', value: 'Node · TypeScript · MongoDB · Vue' },
        { label: 'Idiomas', value: 'Español nativo · Inglés A2' },
        { label: 'Estado', value: 'Abierto a proyectos y vacantes' },
      ],
      rolesLabel: 'ROLES DESEMPEÑADOS',
      roles: [
        {
          title: 'Desarrollador Backend',
          description: 'Desarrollo de servicios y lógica de negocio.',
        },
        { title: 'Desarrollador Full Stack', description: 'Desarrollo de aplicaciones completas.' },
        { title: 'Modelado de datos', description: 'Esquemas, relaciones y consultas.' },
        { title: 'Mentoría técnica', description: 'Revisión de código y acompañamiento técnico.' },
        { title: 'QA y calidad', description: 'Pruebas automatizadas y revisión de cambios.' },
        { title: 'Integraciones', description: 'Conexión con servicios y sistemas existentes.' },
      ],
    },
    services: {
      eyebrow: 'SERVICIOS',
      title: 'Soluciones digitales para tu negocio',
      lead: 'Desarrollo soluciones digitales a medida para tu organización, ya sea que necesites crear algo nuevo, mejorar lo que ya utilizas o mantenerlo en funcionamiento.',
      primaryLabel: 'LO QUE PUEDO CREAR PARA TI',
      complementaryLabel: 'OTRAS FORMAS DE AYUDARTE',
      complementaryNote: 'Puedes pedirlas junto con una solución nueva o por separado.',
      primary: [
        {
          index: '01',
          title: 'Sistemas de gestión a medida',
          description:
            'Desarrollo sistemas de gestión adaptados a la forma de trabajar de tu organización, cubriendo distintas áreas y facilitando el trabajo entre ellas. Incorporo la gestión de clientes, inventario, pagos, facturas y reportes según tus necesidades.',
          scope: [],
        },
        {
          index: '02',
          title: 'Sitios web',
          description:
            'Creo un sitio donde puedas presentar tu negocio, mostrar tus productos y facilitar que te contacten. Se verá bien en celular y computadora.',
          scope: ['Presentación', 'Catálogo', 'Contacto'],
        },
        {
          index: '03',
          title: 'Aplicaciones móviles',
          description:
            'Creo una aplicación para que tus clientes o tu equipo puedan consultar información y hacer gestiones desde el celular.',
          scope: ['Clientes', 'Equipo', 'Gestiones'],
        },
      ],
      complementary: [
        {
          index: '04',
          title: 'Conexión y automatización',
          description:
            'Hago que las herramientas que ya usas compartan información y reduzco tareas repetitivas, como copiar datos de un lugar a otro.',
          scope: [],
        },
        {
          index: '05',
          title: 'Mantenimiento y soporte',
          description:
            'Me encargo de los ajustes, las actualizaciones y los problemas del día a día para que tu sitio o aplicación siga funcionando.',
          scope: [],
        },
        {
          index: '06',
          title: 'Revisión y mejora',
          description:
            'Si algo funciona lento, falla o se ha vuelto difícil de usar, reviso qué pasa y te propongo por dónde empezar a mejorarlo.',
          scope: [],
        },
        {
          index: '07',
          title: 'Acompañamiento a tu equipo',
          description:
            'Si tienes un equipo de desarrollo, lo ayudo a resolver dudas, revisar su trabajo y dar continuidad a lo construido.',
          scope: [],
        },
      ],
      ctaQuestion: '¿Qué necesitas resolver?',
      ctaAction: 'Cuéntame qué necesitas',
    },
    skills: {
      eyebrow: 'HABILIDADES TÉCNICAS',
      title: 'Desarrollo de software con foco en backend',
      lead: 'Diseño APIs, modelo datos y organizo la lógica de negocio para que los sistemas sean fáciles de mantener. Cuando el proyecto lo necesita, también construyo la interfaz y entrego la solución completa.',
      capabilitiesLabel: 'QUÉ APORTO A UN PROYECTO',
      capabilitiesNote:
        'Las áreas donde trabajo con más frecuencia, desde el diseño del sistema hasta la entrega.',
      items: [
        {
          title: 'Arquitectura y APIs',
          description:
            'Diseño APIs y organizo la lógica de negocio para que el sistema pueda evolucionar sin complicar cada cambio.',
          tags: 'REST · GraphQL · servicios',
        },
        {
          title: 'Modelado de datos',
          description:
            'Modelo la información según los procesos del producto y las consultas que necesita.',
          tags: 'SQL · NoSQL · consultas',
        },
        {
          title: 'Seguridad y permisos',
          description:
            'Implemento autenticación, permisos y validación de datos según las necesidades de cada sistema.',
          tags: 'Autenticación · roles · validación',
        },
        {
          title: 'Integraciones',
          description:
            'Conecto servicios externos y aplicaciones existentes sin que el sistema dependa de un solo proveedor.',
          tags: 'APIs externas · sistemas existentes',
        },
        {
          title: 'Calidad de código',
          description:
            'Acompaño los cambios con pruebas y documentación para que el código siga siendo fácil de mantener.',
          tags: 'Pruebas · documentación · revisión',
        },
        {
          title: 'Desarrollo full stack',
          description:
            'Construyo interfaces conectadas al backend, cuidando las acciones y los estados de cada flujo.',
          tags: 'Vue · interfaces · componentes',
        },
      ],
      layersLabel: 'ORGANIZACIÓN POR CAPAS',
      layersNote:
        'En mis proyectos suelo separar la aplicación en cuatro áreas: datos, lógica de negocio, API e interfaz. Esa división me ayuda a mantener claras las responsabilidades de cada parte y a ubicar mejor los cambios.',
      layersHint: 'Selecciona una capa para ver su responsabilidad.',
      layersAction: 'CAPA SELECCIONADA',
      layers: [
        {
          index: '01',
          label: 'DATOS',
          detail: 'esquemas · consultas',
          what: 'Modelo y organizo la información que necesita la aplicación: usuarios, cobros, registros. Aquí viven los esquemas y las consultas.',
        },
        {
          index: '02',
          label: 'BACKEND',
          detail: 'servicios · reglas de negocio',
          what: 'Implemento las reglas de negocio, valido las entradas y coordino las operaciones sobre los datos.',
        },
        {
          index: '03',
          label: 'API',
          detail: 'contratos · permisos',
          what: 'Defino el contrato entre el backend y sus clientes: qué se puede solicitar, qué recibe cada operación y cómo se devuelve la respuesta. Los permisos de acceso también se gestionan aquí.',
        },
        {
          index: '04',
          label: 'INTERFAZ',
          detail: 'componentes · estado',
          what: 'Construyo las pantallas, los componentes y los estados que acompañan cada acción.',
        },
      ],
    },
    stack: {
      meta: {
        technologiesLabel: 'tecnologías',
        areasLabel: 'áreas',
        coreLabel: 'NÚCLEO',
      },
    },
    experience: {
      cv: 'Descargar CV',
      reviewLabel: 'RESEÑA VINCULADA',
      reviewsLabel: 'RESEÑAS VINCULADAS',
      projectLabel: 'PROYECTO VINCULADO',
      projectsLabel: 'PROYECTOS VINCULADOS',
    },
    projects: {
      reviewLabel: 'RESEÑA VINCULADA',
      reviewsLabel: 'RESEÑAS VINCULADAS',
      experienceLabel: 'EXPERIENCIA VINCULADA',
      experiencesLabel: 'EXPERIENCIAS VINCULADAS',
      viewAll: 'Ver todos los proyectos',
      viewProject: 'Ver proyecto',
      viewCase: 'Ver caso',
      relationsLabel: 'VÍNCULOS',
      viewSnippet: 'Ver fragmento',
      hideSnippet: 'Ocultar fragmento',
      codeLabel: 'CÓDIGO',
      privateCode: 'CÓDIGO PRIVADO',
      privateLabel: 'PRIVADO',
      publicLabel: 'PÚBLICO',
      collaborationLabel: 'COLABORACIÓN',
      featuredLabel: 'PRINCIPAL',
    },
    projectsPage: {
      eyebrow: 'PROYECTOS',
      back: 'Volver al portfolio',
      filterLabel: 'Filtrar proyectos',
      filters: {
        all: 'Todos',
        own: 'Directos',
        collaborations: 'Colaboraciones',
      },
      countLabel: 'proyectos',
      empty: 'No hay proyectos en esta categoría.',
    },
    certifications: {
      credentialLabel: 'ID',
    },
    blog: {
      minLabel: 'MIN',
      readMore: 'LEER ARTÍCULO',
      viewAll: 'Ver todos los artículos',
    },
    blogPage: {
      eyebrow: 'BLOG',
      back: 'Volver al inicio',
      countLabel: 'ARTÍCULOS PUBLICADOS',
      featured: 'MÁS RECIENTE',
      highlighted: 'DESTACADO',
      readMore: 'Leer artículo',
      minLabel: 'MIN',
    },
    articlePage: {
      back: 'Volver al blog',
      metaLabel: 'Metadatos del artículo',
      authorLabel: 'AUTOR',
      published: 'PUBLICADO',
      updated: 'ÚLTIMA EDICIÓN',
      readTime: 'LECTURA',
      readTimeUnit: 'MIN',
      toc: 'EN ESTE ARTÍCULO',
      navLabel: 'Artículos adyacentes',
      prev: 'ANTERIOR',
      next: 'SIGUIENTE',
      notFound: 'Este artículo no existe o fue movido.',
      notFoundHint: 'Vuelve al índice para leer lo último publicado.',
      backToBlog: 'Ir al blog',
      footnoteRef: 'Nota',
      footnotesTitle: 'NOTAS',
      backToReference: 'Volver a la referencia',
      galleryLabel: 'Galería de imágenes',
      tableLabel: 'Tabla',
      embedFallback: 'Abrir contenido incrustado',
      unsupportedBlock: 'Este bloque de contenido no es compatible con esta versión del sitio.',
      calloutTones: {
        note: 'NOTA',
        tip: 'CONSEJO',
        warning: 'ADVERTENCIA',
        important: 'IMPORTANTE',
      },
    },
    testimonials: {
      sampleNotice: 'Reseñas de ejemplo para demostrar el diseño. No son testimonios verificados de clientes.',
      sampleBadge: 'EJEMPLO',
      rolesLabel: 'Roles',
      relatedProject: 'PROYECTO RELACIONADO',
      relatedProjects: 'PROYECTOS RELACIONADOS',
      relatedExperience: 'EXPERIENCIA LABORAL RELACIONADA',
      relatedExperiences: 'EXPERIENCIAS LABORALES RELACIONADAS',
      generalReview: 'EXPERIENCIA GENERAL',
      viewAll: 'Ver todas las reseñas',
      showLess: 'Mostrar menos reseñas',
    },
    contact: {
      eyebrow: 'CONTACTO',
      title: 'Contacto',
      lead: 'Hablemos de tu proyecto o de la vacante que quieres cubrir.',
      question: '¿Tienes un sistema que construir, uno que mantener o un equipo al que sumarme?',
      paragraph:
        'Cuéntame el problema, no la solución. Te respondo por correo con el siguiente paso.',
      badges: ['PROYECTOS Y VACANTES', 'REMOTO O LOCAL', 'ESPAÑOL NATIVO / INGLÉS A2'],
      emailAria: 'Escribir un correo a saidlucena519@gmail.com',
      whatsappAria: 'Escribir por WhatsApp al +58 424 888 7764',
      githubAria: 'Abrir el perfil de GitHub de Said Lucena',
      form: {
        nameLabel: 'NOMBRE',
        namePlaceholder: 'Tu nombre',
        emailLabel: 'CORREO',
        emailPlaceholder: 'tu@correo.com',
        subjectLabel: 'ASUNTO',
        subjectPlaceholder: 'De qué quieres hablar',
        messageLabel: 'MENSAJE',
        messagePlaceholder: 'Qué necesitas construir, mantener o resolver',
        submit: 'Enviar mensaje',
        copyEmail: 'Copiar correo',
        copied: 'Correo copiado al portapapeles.',
        copyFailed: 'Tu navegador no permitió copiar. Escríbelo a mano.',
      },
    },
    footer: {
      tagline: 'Para el que tiene que mantenerlo después.',
      sectionsLabel: 'SECCIONES',
      contactLabel: 'CONTACTO',
      meta: '2026 · 0417',
      copyright: '© 2026 Said Lucena · Caracas, VE',
    },
    ui: {
      skipToContent: 'Saltar al contenido',
      opensInNewTab: 'Se abre en una pestaña nueva',
      carouselPrev: 'Proyecto anterior',
      carouselNext: 'Proyecto siguiente',
      loadingContent: 'Cargando contenido…',
      errorContent: 'No se pudo cargar este contenido.',
      retryContent: 'Reintentar',
      emptyContent: 'Todavía no hay contenido disponible.',
    },
  },
  en: {
    meta: {
      title: 'NorthSideBoy (Said Lucena) — Full Stack Developer with a backend focus',
      description:
        "NorthSideBoy, Said Lucena's portfolio: backend and full-stack development, production systems and projects from Caracas, Venezuela.",
    },
    nav: {
      links: [
        { id: 'about', label: 'About' },
        { id: 'services', label: 'Services' },
        { id: 'skills', label: 'Skills' },
        { id: 'stack', label: 'Stack' },
        { id: 'experience', label: 'Experience' },
        { id: 'projects', label: 'Projects' },
        { id: 'blog', label: 'Blog' },
        { id: 'contact', label: 'Contact' },
      ],
      homeLabel: 'NorthSideBoy (Said Lucena) — home',
      navLabel: 'Main navigation',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      themeToDark: 'Switch to dark theme',
      themeToLight: 'Switch to light theme',
      themeToggle: 'Change theme',
      languageLabel: 'Language',
    },
    hero: {
      eyebrow: 'DOSSIER',
      name: 'NorthSideBoy',
      role: 'BACKEND-LEANING FULL STACK DEVELOPER',
      statement: "I'll build your next tech solution.",
      primary: 'See projects',
      secondary: 'Get in touch',
      availability: 'Available for projects and job opportunities · Caracas, VE (UTC−4)',
      imageAlt: 'Identity plate with the initials NSB in cyan, a grid and registration marks',
    },
    stats: [
      { value: '04', label: 'years building backends' },
      { value: '03', label: 'systems in production' },
    ],
    about: {
      eyebrow: "HI, I'M SAID",
      title: "Hi, I'm Said",
      name: 'Said Lucena',
      lead: 'Backend, architecture and data.',
      paragraphs: [
        "I'm a full stack developer with a backend focus and more than four years of experience. I design APIs and structure business logic so the system is easy to understand, maintain and extend.",
        "I work with SQL and NoSQL databases, Docker containers and Linux servers. I've led development projects and teams, with attention to quality, automated testing and code review.",
        "I work with teams and clients that need to build a system, organize one that already exists or maintain it in production. I'm interested in products where architecture decisions have real consequences and the software has to hold up in production.",
      ],
      recordLabel: 'RECORD',
      facts: [
        { label: 'Location', value: 'Caracas, Venezuela' },
        { label: 'Timezone', value: 'UTC−4 · VET' },
        { label: 'Focus', value: 'Backend · Architecture · Scalability' },
        { label: 'Favorite stack', value: 'Node · TypeScript · MongoDB · Vue' },
        { label: 'Languages', value: 'Native Spanish · English A2' },
        { label: 'Status', value: 'Open to projects and roles' },
      ],
      rolesLabel: 'ROLES HELD',
      roles: [
        { title: 'Backend Developer', description: 'Services and business logic.' },
        { title: 'Full Stack Developer', description: 'Complete application development.' },
        { title: 'Data modeling', description: 'Schemas, relations and queries.' },
        { title: 'Technical mentoring', description: 'Code review and technical guidance.' },
        { title: 'QA and quality', description: 'Automated testing and change review.' },
        {
          title: 'Integrations',
          description: 'Connecting external services and existing systems.',
        },
      ],
    },
    services: {
      eyebrow: 'SERVICES',
      title: 'Digital solutions for your business',
      lead: 'I develop tailored digital solutions for your organization, whether you need to build something new, improve what you already use or keep it running.',
      primaryLabel: 'WHAT I CAN BUILD FOR YOU',
      complementaryLabel: 'OTHER WAYS I CAN HELP',
      complementaryNote: 'Ask for these alongside a new solution or on their own.',
      primary: [
        {
          index: '01',
          title: 'Custom management systems',
          description:
            'I develop management systems tailored to how your organization works, covering different areas and helping them work together. I include customer management, inventory, payments, invoicing and reports according to your needs.',
          scope: [],
        },
        {
          index: '02',
          title: 'Websites',
          description:
            'I create a site where you can present your business, show your products and make it easy for people to contact you. It will work on phones and computers.',
          scope: ['About your business', 'Catalogue', 'Contact'],
        },
        {
          index: '03',
          title: 'Mobile apps',
          description:
            'I create an app so your customers or team can find information and get things done from their phones.',
          scope: ['Customers', 'Team', 'Everyday tasks'],
        },
      ],
      complementary: [
        {
          index: '04',
          title: 'Connecting tools and saving time',
          description:
            'I help the tools you already use share information and reduce repetitive work, like copying details from one place to another.',
          scope: [],
        },
        {
          index: '05',
          title: 'Maintenance and support',
          description:
            'I take care of updates, adjustments and day-to-day problems to keep your site or app working.',
          scope: [],
        },
        {
          index: '06',
          title: 'Review and improvement',
          description:
            'If something is slow, breaks or has become hard to use, I look into what is happening and suggest where to start improving it.',
          scope: [],
        },
        {
          index: '07',
          title: 'Support for your team',
          description:
            'If you have a development team, I help them answer questions, review their work and keep things moving.',
          scope: [],
        },
      ],
      ctaQuestion: 'What do you need help with?',
      ctaAction: 'Tell me what you need',
    },
    skills: {
      eyebrow: 'TECHNICAL SKILLS',
      title: 'Software development with a backend focus',
      lead: 'I design APIs, model data and structure business logic to keep systems maintainable. When a project needs it, I also build the interface and ship the whole thing.',
      capabilitiesLabel: 'WHAT I BRING TO A PROJECT',
      capabilitiesNote: 'The areas I work in most often, from system design through delivery.',
      items: [
        {
          title: 'Architecture and APIs',
          description:
            'I design APIs and structure business logic so the system can evolve without making every change harder.',
          tags: 'REST · GraphQL · services',
        },
        {
          title: 'Data modeling',
          description:
            "I model information around the product's processes and the queries it needs.",
          tags: 'SQL · NoSQL · queries',
        },
        {
          title: 'Security and permissions',
          description:
            "I implement authentication, permissions and data validation to match each system's needs.",
          tags: 'Authentication · roles · validation',
        },
        {
          title: 'Integrations',
          description:
            'I connect external services and existing applications without tying the system to a single provider.',
          tags: 'External APIs · existing systems',
        },
        {
          title: 'Code quality',
          description:
            'I support changes with tests and documentation so the code stays easy to maintain.',
          tags: 'Testing · documentation · review',
        },
        {
          title: 'Full-stack development',
          description:
            'I build interfaces connected to the backend, with attention to the actions and states in each flow.',
          tags: 'Vue · interfaces · components',
        },
      ],
      layersLabel: 'LAYERED ORGANIZATION',
      layersNote:
        "In my projects I usually split the application into four areas: data, business logic, API and interface. That division keeps each part's responsibilities clear and makes it easier to see where a change belongs.",
      layersHint: 'Select a layer to see its responsibility.',
      layersAction: 'SELECTED LAYER',
      layers: [
        {
          index: '01',
          label: 'DATA',
          detail: 'schemas · queries',
          what: 'I model and organize the information the application needs: users, charges, records. Schemas and queries live here.',
        },
        {
          index: '02',
          label: 'BACKEND',
          detail: 'services · business rules',
          what: 'I implement business rules, validate input and coordinate operations on the data.',
        },
        {
          index: '03',
          label: 'API',
          detail: 'contracts · permissions',
          what: 'I define the contract between the backend and its clients: what can be requested, what each operation receives and how the response is returned. Access permissions are managed here too.',
        },
        {
          index: '04',
          label: 'INTERFACE',
          detail: 'components · state',
          what: 'I build the screens, components and states that accompany each action.',
        },
      ],
    },
    stack: {
      meta: {
        technologiesLabel: 'technologies',
        areasLabel: 'areas',
        coreLabel: 'CORE',
      },
    },
    experience: {
      cv: 'Download CV (ES)',
      reviewLabel: 'LINKED REVIEW',
      reviewsLabel: 'LINKED REVIEWS',
      projectLabel: 'LINKED PROJECT',
      projectsLabel: 'LINKED PROJECTS',
    },
    projects: {
      reviewLabel: 'LINKED REVIEW',
      reviewsLabel: 'LINKED REVIEWS',
      experienceLabel: 'LINKED EXPERIENCE',
      experiencesLabel: 'LINKED EXPERIENCES',
      viewAll: 'View all projects',
      viewProject: 'View project',
      viewCase: 'View case',
      relationsLabel: 'RELATIONS',
      viewSnippet: 'View snippet',
      hideSnippet: 'Hide snippet',
      codeLabel: 'CODE',
      privateCode: 'PRIVATE CODE',
      privateLabel: 'PRIVATE',
      publicLabel: 'PUBLIC',
      collaborationLabel: 'COLLABORATION',
      featuredLabel: 'FEATURED',
    },
    projectsPage: {
      eyebrow: 'PROJECTS',
      back: 'Back to portfolio',
      filterLabel: 'Filter projects',
      filters: {
        all: 'All',
        own: 'Direct',
        collaborations: 'Collaborations',
      },
      countLabel: 'projects',
      empty: 'No projects in this category.',
    },
    certifications: {
      credentialLabel: 'ID',
    },
    blog: {
      minLabel: 'MIN',
      readMore: 'READ ARTICLE',
      viewAll: 'View all articles',
    },
    blogPage: {
      eyebrow: 'BLOG',
      back: 'Back to home',
      countLabel: 'PUBLISHED ARTICLES',
      featured: 'LATEST',
      highlighted: 'FEATURED',
      readMore: 'Read article',
      minLabel: 'MIN',
    },
    articlePage: {
      back: 'Back to blog',
      metaLabel: 'Article metadata',
      authorLabel: 'AUTHOR',
      published: 'PUBLISHED',
      updated: 'LAST EDITED',
      readTime: 'READING',
      readTimeUnit: 'MIN',
      toc: 'IN THIS ARTICLE',
      navLabel: 'Adjacent articles',
      prev: 'PREVIOUS',
      next: 'NEXT',
      notFound: 'This article does not exist or was moved.',
      notFoundHint: 'Head back to the index to read the latest published piece.',
      backToBlog: 'Go to blog',
      footnoteRef: 'Note',
      footnotesTitle: 'NOTES',
      backToReference: 'Back to reference',
      galleryLabel: 'Image gallery',
      tableLabel: 'Table',
      embedFallback: 'Open embedded content',
      unsupportedBlock: 'This content block is not supported by this version of the site.',
      calloutTones: {
        note: 'NOTE',
        tip: 'TIP',
        warning: 'WARNING',
        important: 'IMPORTANT',
      },
    },
    testimonials: {
      sampleNotice: 'Sample reviews showing the layout. These are not verified client testimonials.',
      sampleBadge: 'SAMPLE',
      rolesLabel: 'Roles',
      relatedProject: 'RELATED PROJECT',
      relatedProjects: 'RELATED PROJECTS',
      relatedExperience: 'RELATED WORK EXPERIENCE',
      relatedExperiences: 'RELATED WORK EXPERIENCES',
      generalReview: 'GENERAL EXPERIENCE',
      viewAll: 'View all reviews',
      showLess: 'Show fewer reviews',
    },
    contact: {
      eyebrow: 'CONTACT',
      title: 'Contact',
      lead: 'Let’s talk about your project or the role you need to fill.',
      question: 'Do you have a system to build, one to maintain, or a team I can join?',
      paragraph: 'Tell me the problem, not the solution. I reply by email with the next step.',
      badges: ['PROJECTS AND ROLES', 'REMOTE OR LOCAL', 'SPANISH NATIVE / ENGLISH A2'],
      emailAria: 'Write an email to saidlucena519@gmail.com',
      whatsappAria: 'Message +58 424 888 7764 on WhatsApp',
      githubAria: 'Open Said Lucena’s GitHub profile',
      form: {
        nameLabel: 'NAME',
        namePlaceholder: 'Your name',
        emailLabel: 'EMAIL',
        emailPlaceholder: 'you@email.com',
        subjectLabel: 'SUBJECT',
        subjectPlaceholder: 'What this is about',
        messageLabel: 'MESSAGE',
        messagePlaceholder: 'What you need to build, maintain or solve',
        submit: 'Send message',
        copyEmail: 'Copy email',
        copied: 'Email copied to clipboard.',
        copyFailed: 'Your browser did not allow copying. Write it down manually.',
      },
    },
    footer: {
      tagline: 'For whoever has to maintain it later.',
      sectionsLabel: 'SECTIONS',
      contactLabel: 'CONTACT',
      meta: '2026 · 0417',
      copyright: '© 2026 Said Lucena · Caracas, VE',
    },
    ui: {
      skipToContent: 'Skip to content',
      opensInNewTab: 'Opens in a new tab',
      carouselPrev: 'Previous project',
      carouselNext: 'Next project',
      loadingContent: 'Loading content…',
      errorContent: 'This content could not be loaded.',
      retryContent: 'Try again',
      emptyContent: 'No content is available yet.',
    },
  },
}
