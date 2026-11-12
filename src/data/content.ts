import type { ReviewDraftIssue } from '@/data/reviews'
import type { AuthErrorKey, PublishErrorKey } from '@/lib/reviews/errors'

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
  seo: {
    personName: string
    alternateName: string
    jobTitle: string
    ogImageAlt: string
    email: string
    sameAs: string[]
    locality: string
    country: string
  }
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
    homeBreadcrumb: string
    breadcrumbLabel: string
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
    rolesLabel: string
    relatedProject: string
    relatedProjects: string
    relatedExperience: string
    relatedExperiences: string
    generalReview: string
    viewAll: string
    showLess: string
  }
  reviews: {
    meta: {
      accessTitle: string
      accessDescription: string
      panelTitle: string
      panelDescription: string
    }
    invite: {
      eyebrow: string
      title: string
      body: string
      action: string
      emptyEyebrow: string
      emptyTitle: string
      emptyBody: string
    }
    access: {
      eyebrow: string
      title: string
      lead: string
      back: string
      steps: { index: string; title: string; body: string }[]
      cardLabel: string
      cardTitle: string
      cardBody: string
      google: string
      googleLoading: string
      signingIn: string
      redirecting: string
      note: string
      noscript: string
    }
    panel: {
      eyebrow: string
      title: string
      lead: string
      back: string
      checking: string
      redirecting: string
      noscript: string
      sessionLabel: string
      switchAccount: string
      signOut: { title: string; body: string; cancel: string; confirm: string }
      sections: { relations: string; testimonial: string; publish: string }
      fields: {
        rolesLabel: string
        rolesHint: string
        rolesPlaceholder: string
        rolesRemove: string
        rolesFull: string
        rolesInvalid: string
        relationLabel: string
        relationHint: string
        relationOptional: string
        experienceGroup: string
        projectGroup: string
        relationMax: string
        quoteLabel: string
        quoteHint: string
        quotePlaceholder: string
      }
      actions: {
        publish: string
        publishing: string
        save: string
        saving: string
        discard: string
        edit: string
        home: string
      }
      preview: {
        title: string
        note: string
        pending: string
        placeholder: string
        rolesPlaceholder: string
        jump: string
      }
      status: {
        pendingTitle: string
        pendingBody: string
        approvedTitle: string
        approvedBody: string
        approvedAction: string
        submittedTitle: string
        submittedBody: string
        invalidTitle: string
        errorTitle: string
      }
      errors: {
        auth: Record<AuthErrorKey, string>
        publish: Record<PublishErrorKey, string>
        validation: Record<ReviewDraftIssue, string>
      }
      consent: string
      contact: string
    }
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
    seo: {
      personName: 'Said Lucena',
      alternateName: 'NorthSideBoy',
      jobTitle: 'Desarrollador Full Stack con foco en backend',
      ogImageAlt: 'NorthSideBoy — portfolio de Said Lucena',
      email: 'saidlucena519@gmail.com',
      sameAs: ['https://github.com/NorthSideBoy'],
      locality: 'Caracas',
      country: 'VE',
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
      homeBreadcrumb: 'Inicio',
      breadcrumbLabel: 'Ruta de navegación',
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
      rolesLabel: 'Roles',
      relatedProject: 'PROYECTO',
      relatedProjects: 'PROYECTOS',
      relatedExperience: 'EXPERIENCIA',
      relatedExperiences: 'EXPERIENCIAS',
      generalReview: 'EXPERIENCIA GENERAL',
      viewAll: 'Ver todas las reseñas',
      showLess: 'Mostrar menos',
    },
    reviews: {
      meta: {
        accessTitle: 'Deja tu reseña — Said Lucena',
        accessDescription:
          'Inicia sesión con Google y deja una reseña.',
        panelTitle: 'Tu reseña — Said Lucena',
        panelDescription:
          'Escribe y envía una reseña de tu trabajo con Said Lucena.',
      },
      invite: {
        eyebrow: 'RESEÑAS ABIERTAS',
        title: 'Cuéntame cómo fue.',
        body: 'Deja una reseña y menciona el proyecto o la experiencia que quieras.',
        action: 'Dejar una reseña',
        emptyEyebrow: 'AÚN NO HAY RESEÑAS',
        emptyTitle: 'Tu reseña puede ser la primera.',
        emptyBody: 'Cuéntame en qué trabajamos y qué cambió.',
      },
      access: {
        eyebrow: 'RESEÑAS',
        title: 'Deja tu reseña',
        lead: 'Cuéntame qué hicimos juntos y qué cambió.',
        back: 'Volver al inicio',
        steps: [
          {
            index: '01',
            title: 'Entra con Google',
            body: 'Tu información viene de Google.',
          },
          {
            index: '02',
            title: 'Escribe y revisa',
            body: 'Cuéntame qué problema resolvimos y qué cambió.',
          },
          {
            index: '03',
            title: 'Envíala',
            body: 'Envía tu reseña cuando estés conforme.',
          },
        ],
        cardLabel: 'ACCESO · GOOGLE',
        cardTitle: 'Cuéntame tu experiencia.',
        cardBody: 'Solo te tomará un minuto.',
        google: 'Continuar con Google',
        googleLoading: 'Preparando acceso…',
        signingIn: 'Esperando a Google…',
        redirecting: 'Ya iniciaste sesión. Abriendo tu reseña…',
        note: 'Al continuar, aceptas que tu información se muestre en el portfolio.',
        noscript: 'Activa JavaScript para iniciar sesión con Google.',
      },
      panel: {
        eyebrow: 'RESEÑAS',
        title: 'Tu reseña',
        lead: 'Escribe tu reseña, revísala en la vista previa y envíala.',
        back: 'Volver a las reseñas',
        checking: 'Comprobando sesión…',
        redirecting: 'Redirigiendo al acceso…',
        noscript:
          'Activa JavaScript para comprobar tu sesión y enviar la reseña.',
        sessionLabel: 'SESIÓN DE GOOGLE',
        switchAccount: 'Cambiar cuenta',
        signOut: {
          title: '¿Salir de esta cuenta?',
          body: 'Si tienes cambios sin enviar, se perderán.',
          cancel: 'Seguir editando',
          confirm: 'Salir de todos modos',
        },
        sections: {
          relations: 'CONTEXTO',
          testimonial: 'SOBRE TU EXPERIENCIA',
          publish: 'ENVIAR',
        },
        fields: {
          rolesLabel: 'TUS ROLES',
          rolesHint: 'Por ejemplo: cliente, colega o líder de proyecto.',
          rolesPlaceholder: 'Añade un rol y pulsa Enter',
          rolesRemove: 'Eliminar rol',
          rolesFull: 'Puedes añadir hasta 3 roles.',
          rolesInvalid: 'Cada rol debe tener entre 2 y 60 caracteres.',
          relationLabel: 'EXPERIENCIA O PROYECTO',
          relationHint: 'Opcional. Selecciona el trabajo que quieres mencionar.',
          relationOptional: 'También puedes dejar una reseña general.',
          experienceGroup: 'Experiencia laboral',
          projectGroup: 'Proyectos',
          relationMax: 'Puedes seleccionar hasta 3.',
          quoteLabel: 'TU RESEÑA',
          quoteHint: 'Entre 40 y 400 caracteres.',
          quotePlaceholder:
            '¿Qué problema resolvimos? ¿Qué cambió? ¿Cómo fue trabajar juntos?',
        },
        actions: {
          publish: 'Enviar reseña',
          publishing: 'Enviando…',
          save: 'Guardar cambios',
          saving: 'Guardando…',
          discard: 'Descartar cambios',
          edit: 'Editar reseña',
          home: 'Volver al inicio',
        },
        preview: {
          title: 'VISTA PREVIA',
          note: 'Así se verá tu reseña en el portfolio.',
          pending: 'BORRADOR',
          placeholder: 'Tu reseña aparecerá aquí.',
          rolesPlaceholder: 'Tu rol',
          jump: 'Ver vista previa',
        },
        status: {
          pendingTitle: 'Reseña recibida',
          pendingBody: 'La revisaré en breve. Mientras tanto, puedes editarla.',
          approvedTitle: 'Tu reseña ya está publicada.',
          approvedBody: 'Si necesitas corregir algo, escríbeme y lo actualizo.',
          approvedAction: 'Ver las reseñas',
          submittedTitle: 'Reseña enviada',
          submittedBody: 'Gracias. La revisaré en breve.',
          invalidTitle: 'Revisa los campos marcados.',
          errorTitle: 'No pudimos enviar tu reseña.',
        },
        errors: {
          auth: {
            cancelled: '',
            'popup-blocked':
              'Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.',
            'unauthorized-domain':
              'El inicio de sesión no está disponible en este dominio.',
            network:
              'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.',
            'unsupported-environment':
              'Este navegador no permite el inicio de sesión. Abre el enlace en un navegador estándar.',
            'storage-unsupported':
              'Tu navegador bloqueó el almacenamiento necesario. Activa las cookies o usa una ventana normal.',
            'provider-disabled': 'El acceso con Google no está habilitado.',
            'email-missing': 'No pudimos obtener tu correo de Google.',
            unknown: 'No pudimos iniciar sesión con Google. Inténtalo de nuevo.',
          },
          publish: {
            'permission-denied': 'Inténtalo de nuevo.',
            network:
              'No pudimos conectar. Tu texto sigue aquí. Inténtalo de nuevo.',
            quota:
              'Hay demasiadas solicitudes ahora. Inténtalo en unos minutos.',
            'invalid-document':
              'No pudimos leer tu reseña guardada. Recarga la página o escríbeme.',
            unknown:
              'Tu texto sigue aquí. Inténtalo de nuevo.',
          },
          validation: {
            'roles-required': 'Añade al menos un rol.',
            'roles-max': 'Puedes añadir hasta 3 roles.',
            'role-length': 'Cada rol debe tener entre 2 y 60 caracteres.',
            'quote-min': 'Escribe al menos 40 caracteres.',
            'quote-max': 'La reseña no puede superar los 400 caracteres.',
            'relations-max': 'Puedes seleccionar hasta 3.',
            'anchor-invalid': 'No pudimos preparar la reseña. Recarga la página.',
            'locale-invalid': 'Elige un idioma para la reseña.',
          },
        },
        consent:
          'Al enviar, aceptas que tu información se muestre en el portfolio.',
        contact: 'Escríbeme',
      },
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
    seo: {
      personName: 'Said Lucena',
      alternateName: 'NorthSideBoy',
      jobTitle: 'Backend-leaning Full Stack Developer',
      ogImageAlt: "NorthSideBoy — Said Lucena's portfolio",
      email: 'saidlucena519@gmail.com',
      sameAs: ['https://github.com/NorthSideBoy'],
      locality: 'Caracas',
      country: 'VE',
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
      homeBreadcrumb: 'Home',
      breadcrumbLabel: 'Breadcrumb',
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
      relationsLabel: 'LINKS',
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
      rolesLabel: 'Roles',
      relatedProject: 'PROJECT',
      relatedProjects: 'PROJECTS',
      relatedExperience: 'EXPERIENCE',
      relatedExperiences: 'EXPERIENCES',
      generalReview: 'GENERAL EXPERIENCE',
      viewAll: 'View all reviews',
      showLess: 'Show less',
    },
    reviews: {
      meta: {
        accessTitle: 'Leave a review — Said Lucena',
        accessDescription:
          'Sign in with Google and leave a review.',
        panelTitle: 'Your review — Said Lucena',
        panelDescription: 'Write and send a review of your work with Said Lucena.',
      },
      invite: {
        eyebrow: 'REVIEWS OPEN',
        title: 'Tell me how it went.',
        body: 'Leave a review and mention the project or experience you want.',
        action: 'Leave a review',
        emptyEyebrow: 'NO REVIEWS YET',
        emptyTitle: 'Your review can be the first.',
        emptyBody: 'Tell me what we worked on and what changed.',
      },
      access: {
        eyebrow: 'REVIEWS',
        title: 'Leave your review',
        lead: 'Tell me what we built together and what changed.',
        back: 'Back to home',
        steps: [
          {
            index: '01',
            title: 'Sign in with Google',
            body: 'Your information comes from Google.',
          },
          {
            index: '02',
            title: 'Write and review',
            body: 'Tell me what problem we solved and what changed.',
          },
          {
            index: '03',
            title: 'Send it',
            body: 'Send your review when you are happy with it.',
          },
        ],
        cardLabel: 'ACCESS · GOOGLE',
        cardTitle: 'Share your experience.',
        cardBody: 'It will only take a minute.',
        google: 'Continue with Google',
        googleLoading: 'Preparing access…',
        signingIn: 'Waiting for Google…',
        redirecting: 'You are signed in. Opening your review…',
        note: 'By continuing, you agree that your information will be shown on the portfolio.',
        noscript: 'Enable JavaScript to sign in with Google.',
      },
      panel: {
        eyebrow: 'REVIEWS',
        title: 'Your review',
        lead: 'Write your review, check the preview and send it.',
        back: 'Back to reviews',
        checking: 'Checking session…',
        redirecting: 'Redirecting to sign-in…',
        noscript:
          'Enable JavaScript to check your session and send the review.',
        sessionLabel: 'GOOGLE SESSION',
        switchAccount: 'Switch account',
        signOut: {
          title: 'Sign out of this account?',
          body: 'If you have unsent changes, they will be lost.',
          cancel: 'Keep editing',
          confirm: 'Sign out anyway',
        },
        sections: {
          relations: 'CONTEXT',
          testimonial: 'ABOUT YOUR EXPERIENCE',
          publish: 'SEND',
        },
        fields: {
          rolesLabel: 'YOUR ROLES',
          rolesHint: 'For example: client, colleague or project lead.',
          rolesPlaceholder: 'Add a role and press Enter',
          rolesRemove: 'Remove role',
          rolesFull: 'You can add up to 3 roles.',
          rolesInvalid: 'Each role must be between 2 and 60 characters.',
          relationLabel: 'EXPERIENCE OR PROJECT',
          relationHint: 'Optional. Select the work you want to mention.',
          relationOptional: 'You can also leave a general review.',
          experienceGroup: 'Work experience',
          projectGroup: 'Projects',
          relationMax: 'You can select up to 3.',
          quoteLabel: 'YOUR REVIEW',
          quoteHint: 'Between 40 and 400 characters.',
          quotePlaceholder:
            'What problem did we solve? What changed? What was it like to work together?',
        },
        actions: {
          publish: 'Send review',
          publishing: 'Sending…',
          save: 'Save changes',
          saving: 'Saving…',
          discard: 'Discard changes',
          edit: 'Edit review',
          home: 'Back to home',
        },
        preview: {
          title: 'PREVIEW',
          note: 'This is how your review will look on the portfolio.',
          pending: 'DRAFT',
          placeholder: 'Your review will appear here.',
          rolesPlaceholder: 'Your role',
          jump: 'View preview',
        },
        status: {
          pendingTitle: 'Review received',
          pendingBody: 'I will review it shortly. In the meantime, you can edit it.',
          approvedTitle: 'Your review is published.',
          approvedBody: 'If you need to correct something, write to me and I will update it.',
          approvedAction: 'View reviews',
          submittedTitle: 'Review sent',
          submittedBody: 'Thank you. I will review it shortly.',
          invalidTitle: 'Check the highlighted fields.',
          errorTitle: 'We could not send your review.',
        },
        errors: {
          auth: {
            cancelled: '',
            'popup-blocked':
              'Your browser blocked the Google window. Allow pop-ups and try again.',
            'unauthorized-domain': 'Sign-in is not available on this domain.',
            network: 'We could not connect. Check your connection and try again.',
            'unsupported-environment':
              'This browser does not support sign-in. Open the link in a standard browser.',
            'storage-unsupported':
              'Your browser blocked the required storage. Enable cookies or use a normal window.',
            'provider-disabled': 'Google sign-in is not enabled.',
            'email-missing': 'We could not get your Google email.',
            unknown: 'We could not sign in with Google. Please try again.',
          },
          publish: {
            'permission-denied': 'Please try again.',
            network:
              'We could not connect. Your text is still here. Please try again.',
            quota: 'There are too many requests right now. Try again in a few minutes.',
            'invalid-document':
              'We could not read your saved review. Reload the page or write to me.',
            unknown:
              'Your text is still here. Please try again.',
          },
          validation: {
            'roles-required': 'Add at least one role.',
            'roles-max': 'You can add up to 3 roles.',
            'role-length': 'Each role must be between 2 and 60 characters.',
            'quote-min': 'Write at least 40 characters.',
            'quote-max': 'The review cannot exceed 400 characters.',
            'relations-max': 'You can select up to 3.',
            'anchor-invalid': 'We could not prepare the review. Reload the page.',
            'locale-invalid': 'Choose a language for the review.',
          },
        },
        consent:
          'By sending, you agree that your information will be shown on the portfolio.',
        contact: 'Write to me',
      },
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
