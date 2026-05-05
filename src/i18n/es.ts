export default {
  nav: {
    services: 'Servicios',
    process: 'Proceso',
    team: 'Equipo',
    skills: 'Habilidades',
    research: 'Research',
    contact: 'Contáctanos',
  },
  hero: {
    title: 'Impulsamos soluciones de software e inteligencia artificial para negocios reales',
    subtitle:
      'Consultoría técnica, desarrollo de software, implementación de IA y formación especializada por un equipo de primer nivel.',
    cta: 'Hablemos',
    ctaSecondary: 'Ver equipo',
  },
  services: {
    title: 'Qué hacemos',
    subtitle: 'Combinamos experiencia técnica profunda con visión estratégica para entregar valor real.',
    items: [
      {
        title: 'Consultoría en desarrollo de software',
        description:
          'Diseñamos y guiamos soluciones técnicas escalables, mantenibles y alineadas al negocio.',
        details: [
          'Arquitectura de soluciones',
          'Diseño técnico',
          'Modernización de sistemas',
          'Acompañamiento en decisiones tecnológicas',
        ],
      },
      {
        title: 'Implementación de soluciones con IA',
        description:
          'Construimos e integramos soluciones inteligentes para automatizar procesos y generar valor real.',
        details: [
          'Automatización inteligente',
          'Integración de modelos de IA',
          'Sistemas asistidos por IA',
          'Soluciones a medida para procesos de negocio',
        ],
      },
      {
        title: 'Formación especializada',
        description:
          'Capacitamos equipos en inteligencia artificial, desarrollo de software y prácticas técnicas avanzadas.',
        details: [
          'Talleres técnicos',
          'Capacitación para equipos',
          'Mentoría en IA y arquitectura',
          'Programas adaptados al nivel del cliente',
        ],
      },
    ],
  },
  process: {
    eyebrow: 'Client Value Delivery Framework',
    title: 'Cómo trabajamos',
    subtitle:
      'Convertimos retos reales de negocio en soluciones medibles, adoptables y sostenibles. Cuatro fases con un punto de decisión claro al final de cada una — para proteger tu inversión.',
    stagesLabel: 'Las 4 fases',
    deliverableLabel: 'Entregable',
    gateLabel: 'Decisión gate',
    stages: [
      {
        number: '01',
        short: 'Descubrimos',
        title: 'Escuchamos, entendemos y diagnosticamos',
        kicker: 'Conversación inicial + assessment técnico, de negocio y de datos',
        description:
          'Comprendemos el contexto del negocio, el problema central, los objetivos estratégicos y las restricciones actuales; y evaluamos procesos, datos, arquitectura, capacidades del equipo y riesgos operativos. Construimos un Business Value Case que cuantifica valor esperado, ahorro operativo, impacto financiero, reducción de riesgo y nivel de inversión requerido.',
        deliverable: 'Problem Brief, Assessment Report, mapa impacto/esfuerzo, registro de riesgos y business value case.',
        gate: '¿Vale la pena invertir? ¿Cuál es la mejor ruta de acción?',
      },
      {
        number: '02',
        short: 'Diseñamos',
        title: 'Diseñamos el blueprint de solución',
        kicker: 'Co-creación de arquitectura, KPIs y gobernanza',
        description:
          'Co-creamos arquitectura objetivo, alcance funcional, experiencia del usuario, comportamiento del agente de IA, integraciones, métricas de éxito, riesgos y plan de gobernanza. Antes de construir, definimos qué significa éxito y cómo lo mediremos.',
        deliverable: 'Solution Blueprint, roadmap, backlog inicial, KPIs, criterios de aceptación y plan de gobernanza.',
        gate: '¿Qué construimos, cómo lo mediremos y qué riesgos controlaremos?',
      },
      {
        number: '03',
        short: 'Construimos',
        title: 'Construimos, pilotamos y validamos con evidencia',
        kicker: 'MVP en sprints cortos · validación multidimensional · go / no-go',
        description:
          'Ejecutamos en sprints cortos con demos frecuentes, CI/CD y — cuando hay IA — MLOps y monitoreo de modelos. Validamos contra métricas técnicas, funcionales, operativas, financieras, de adopción y de riesgo, evaluando precisión, trazabilidad, explicabilidad, sesgo y necesidad de supervisión humana.',
        deliverable: 'MVP/piloto funcional, integraciones, Validation Report, resultados de KPIs y recomendación go / no-go.',
        gate: '¿La solución demuestra valor real y está lista para escalar a producción?',
      },
      {
        number: '04',
        short: 'Activamos',
        title: 'Activamos, acompañamos y evolucionamos',
        kicker: 'Go-live, change management, hypercare y mejora continua',
        description:
          'Lanzamos con un plan formal de gestión del cambio: stakeholder map, champions internos, training por rol, comunicación, métricas de adopción y soporte hypercare. Después del go-live monitoreamos desempeño, adopción, valor generado e incidentes, y ajustamos el roadmap evolutivo de la solución con el negocio, los datos y la tecnología.',
        deliverable: 'Go-live plan, documentación, training, soporte hypercare, tablero de métricas y roadmap evolutivo.',
        gate: '¿Cómo logramos uso real y sostenido, y seguimos generando valor después del lanzamiento?',
      },
    ],
    governance: {
      eyebrow: 'Capa transversal',
      title: 'Gobernanza, Seguridad & Responsible AI',
      subtitle: 'Aplicada en todas las etapas — no como un paso opcional al final.',
      pillars: [
        { title: 'Privacidad de datos', description: 'Clasificación y manejo de datos sensibles según normativa.' },
        { title: 'Seguridad y accesos', description: 'Control de acceso, cifrado, auditoría y trazabilidad.' },
        { title: 'Riesgos del modelo', description: 'Evaluación de sesgo, fairness y robustez.' },
        { title: 'Human-in-the-loop', description: 'Supervisión humana en decisiones críticas.' },
        { title: 'Explicabilidad', description: 'Transparencia en cómo el agente toma decisiones.' },
        { title: 'Seguridad de prompts', description: 'Protección contra inyección y abuso.' },
        { title: 'Monitoreo continuo', description: 'Detección de drift y degradación post-go-live.' },
        { title: 'Política de uso', description: 'Marco de uso aceptable y responsabilidad clara.' },
        { title: 'Compliance', description: 'Documentación auditable en cada etapa.' },
      ],
    },
    modalities: {
      title: 'Modalidades para empezar',
      subtitle: 'Tres formas de iniciar — eliges según el momento de tu organización.',
      items: [
        {
          name: 'Advisory Sprint',
          tag: 'Diagnóstico rápido',
          duration: '1 – 2 semanas',
          description:
            'Para clientes que necesitan claridad antes de invertir. Diagnóstico acelerado de oportunidad, riesgo y ruta de acción.',
          outcomeLabel: 'Resultado',
          outcome: 'Roadmap, oportunidades priorizadas, riesgos identificados y quick wins.',
        },
        {
          name: 'Pilot / MVP Build',
          tag: 'Probar valor real',
          duration: '4 – 8 semanas',
          description:
            'Para clientes que quieren validar una solución con datos y usuarios reales antes de comprometer una implementación completa.',
          outcomeLabel: 'Resultado',
          outcome: 'Prototipo funcional, métricas iniciales, business case validado y plan de escalamiento.',
        },
        {
          name: 'Implementation & Scale',
          tag: 'Producción y operación',
          duration: '8 – 16+ semanas',
          description:
            'Para clientes listos para llevar la solución a producción con todos los controles de calidad, adopción y operación.',
          outcomeLabel: 'Resultado',
          outcome: 'Solución operativa, documentación, training, monitoreo y soporte continuo.',
        },
      ],
    },
    cta: 'Hablemos de tu reto',
  },
  team: {
    title: 'Quiénes somos',
    subtitle:
      'Ayudamos a empresas a diseñar, construir e implementar soluciones de inteligencia artificial y software a medida, enfocadas en resolver problemas reales de negocio.\n\nSomos un equipo con experiencia en IA, arquitectura de software y estrategia de producto. Nuestro enfoque: automatizar procesos, optimizar operaciones y crear productos digitales escalables que generan impacto medible.\n\nTrabajamos junto a nuestros clientes para transformar ideas en soluciones concretas y reducir la complejidad tecnológica en cada etapa de su crecimiento.',
    members: [
      {
        name: 'Marxjhony Jerez',
        role: 'CEO · Doctor en Ciencias Aplicadas',
        description:
          'Líder estratégico en consultoría tecnológica con experiencia en IA, desarrollo de software, análisis de datos y automatización. Transforma desafíos complejos en soluciones que generan eficiencia operativa y ventaja competitiva. Combina visión de negocio, liderazgo ágil y expertise técnico para impulsar organizaciones más inteligentes y escalables.',
        skills: ['Estrategia Digital', 'IA', 'Gestión de Proyectos', 'Automatización', 'Desarrollador de Software', 'Agentes', 'Product Manager'],
      },
      {
        name: 'Angel Gil',
        role: 'COO · Doctor en Ciencias Aplicadas',
        description:
          'Especialista en inteligencia artificial y robótica con experiencia en desarrollo de software, DevOps y liderazgo de producto. Diseña soluciones tecnológicas escalables que resuelven problemas reales de negocio, combinando arquitectura técnica y visión estratégica. Apasionado por la tecnología y el bienestar animal.',
        skills: ['IA', 'Robótica', 'Producto', 'DevOps', 'Desarrollador de Software', 'Agentes', 'Tech Lead'],
      },
      {
        name: 'Ricardo Dos Santos',
        role: 'CTO · Doctor en Ciencias Aplicadas',
        description:
          'Especialista en desarrollo de software con IA e investigación en Big Data, Machine Learning y Social Analytics. Diseña entornos inteligentes basados en datos utilizando Semantic Mining y Linked Data para transformar datasets complejos en insights accionables de negocio. Combina pensamiento analítico riguroso con un enfoque estratégico para construir soluciones escalables.',
        skills: ['IA', 'Big Data', 'Machine Learning', 'Semantic Mining', 'Linked Data', 'Ambient Intelligence', 'Desarrollador de Software', 'Agentes', 'Arquitecto de Soluciones'],
      },
    ],
  },
  skills: {
    title: 'Habilidades y Áreas de Experiencia',
    subtitle: 'Un vistazo a las capacidades técnicas e industrias en las que trabajamos.',
    categories: [
      {
        label: 'IA y Datos',
        items: [
          'LLMs',
          'RAG',
          'Machine Learning',
          'MLOps',
          'Analítica de Datos',
          'IA Generativa',
          'Prompt Engineering',
          'Computer Vision',
          'NLP',
          'IA Agéntica',
        ],
      },
      {
        label: 'Ingeniería',
        items: [
          'Desarrollo de Software',
          'DevOps',
          'Arquitectura Cloud',
          'Microservicios',
          'Arquitectura de Soluciones',
        ],
      },
      {
        label: 'Operaciones',
        items: [
          'Automatización',
          'Optimización de Procesos',
          'Gestión de Proyectos',
          'Metodologías Ágiles',
        ],
      },
      {
        label: 'Industrias',
        items: [
          'Energía',
          'Salud',
          'Finanzas',
          'Marketing',
          'Retail',
          'Manufactura',
          'Educación',
          'Logística',
          'Deportes',
        ],
      },
    ],
  },
  research: {
    title: 'Research',
    subtitle:
      'Sabemos que para dar soluciones primero debemos conocer los fundamentos. Por eso investigamos constantemente y aplicamos esos conocimientos a casos prácticos. Aquí mostramos un poco de lo que hacemos.',
    readMore: 'Leer más',
    close: 'Cerrar',
    reference: 'Referencia',
    ctaTitle: '¿Quieres aplicar esto a tu negocio?',
    ctaSubtitle: 'Cuéntanos tu reto y te ayudamos a definir una solución clara y viable.',
    ctaButton: 'Hablemos',
  },
  ctaBanner: {
    title: 'Construyamos algo juntos',
    subtitle: 'Cuéntanos tu reto y te ayudamos a definir una solución clara y viable.',
    cta: 'Iniciar conversación',
  },
  contact: {
    title: 'Contáctanos',
    subtitle:
      'Cuéntanos tu reto y te ayudamos a definir una solución clara, viable y escalable.',
    form: {
      name: 'Nombre',
      email: 'Correo electrónico',
      company: 'Empresa (opcional)',
      message: 'Mensaje',
      submit: 'Enviar mensaje',
      sending: 'Enviando...',
      success: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.',
      error: 'Algo salió mal. Intenta de nuevo o escríbenos directamente.',
    },
  },
  footer: {
    rights: '© 2026 Agentic-AMR Consultants. Todos los derechos reservados.',
    tagline: 'Consultoría en inteligencia artificial, automatización y desarrollo de software para empresas que buscan escalar.',
  },
}
