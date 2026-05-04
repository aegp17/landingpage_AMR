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
      'Convertimos retos reales de negocio en soluciones medibles, adoptables y sostenibles. Siete etapas, tres fases y un punto de decisión claro al final de cada paso — para proteger tu inversión.',
    phasesLabel: 'Fases del framework',
    phases: [
      {
        id: 'discovery',
        tag: 'Fase 1',
        title: 'Discovery & Assessment',
        description:
          'Entender el problema, evaluar madurez técnica, riesgo y oportunidad económica antes de comprometer recursos.',
      },
      {
        id: 'design',
        tag: 'Fase 2',
        title: 'Design & Build',
        description:
          'Co-diseñar el blueprint, construir un MVP en sprints cortos y validar con evidencia técnica, funcional y de negocio.',
      },
      {
        id: 'deploy',
        tag: 'Fase 3',
        title: 'Deploy & Evolve',
        description:
          'Lanzar con gestión del cambio, medir adopción y valor generado, y evolucionar con el negocio.',
      },
    ],
    stagesLabel: 'Las 7 etapas',
    deliverableLabel: 'Entregable',
    gateLabel: 'Decisión gate',
    stages: [
      {
        number: '01',
        phase: 'discovery',
        short: 'Escuchamos',
        title: 'Escuchamos y entendemos',
        kicker: 'Conversación inicial · sin compromiso',
        description:
          'Sesión inicial para comprender el contexto del negocio, el problema principal, los objetivos estratégicos y las restricciones actuales. Identificamos si el reto requiere consultoría, automatización, IA, capacitación — o una combinación.',
        deliverable: 'Problem Brief inicial con objetivos, restricciones y criterios de éxito.',
        gate: '¿Existe un problema claro y relevante que vale la pena explorar?',
      },
      {
        number: '02',
        phase: 'discovery',
        short: 'Diagnosticamos',
        title: 'Diagnosticamos oportunidad, madurez y riesgo',
        kicker: 'Assessment técnico, de negocio y de datos',
        description:
          'Evaluamos procesos, datos, arquitectura, herramientas, capacidades del equipo, riesgos operativos y oportunidades de automatización. Construimos un Business Value Case que cuantifica valor esperado, ahorro operativo, impacto financiero, reducción de riesgo y nivel de inversión requerido.',
        deliverable: 'Assessment Report, mapa impacto/esfuerzo, registro de riesgos, business value case.',
        gate: '¿Vale la pena invertir? ¿Cuál es la mejor ruta de acción?',
      },
      {
        number: '03',
        phase: 'design',
        short: 'Diseñamos',
        title: 'Diseñamos el blueprint de solución',
        kicker: 'Co-creación de arquitectura y plan',
        description:
          'Co-creamos arquitectura objetivo, alcance funcional, experiencia del usuario, comportamiento del agente de IA, integraciones, métricas de éxito, riesgos y plan de gobernanza. Antes de construir, definimos qué significa éxito y cómo lo mediremos.',
        deliverable: 'Solution Blueprint, roadmap, backlog inicial, KPIs, criterios de aceptación, plan de gobernanza.',
        gate: '¿Qué construimos, cómo lo mediremos y qué riesgos controlaremos?',
      },
      {
        number: '04',
        phase: 'design',
        short: 'Construimos',
        title: 'Pilotamos y construimos en ciclos cortos',
        kicker: 'MVP, sprints, demos y feedback',
        description:
          'Ejecutamos en sprints cortos con demos frecuentes y feedback continuo. Priorizamos un MVP o piloto funcional que permita validar valor con usuarios, datos y procesos reales antes de escalar. Aplicamos prácticas modernas de testing, CI/CD y, cuando hay IA, MLOps y monitoreo de modelos.',
        deliverable: 'MVP/piloto funcional, integraciones iniciales, backlog refinado, demos ejecutivas.',
        gate: '¿La solución demuestra valor suficiente para escalar?',
      },
      {
        number: '05',
        phase: 'design',
        short: 'Validamos',
        title: 'Validamos con evidencia',
        kicker: 'Validación multidimensional · go / no-go',
        description:
          'Validamos contra métricas técnicas, funcionales, operativas, financieras, de adopción y de riesgo. En proyectos de IA evaluamos también precisión, trazabilidad, explicabilidad, sesgo, seguridad y necesidad de supervisión humana.',
        deliverable: 'Validation Report, resultados de KPIs, riesgos residuales, recomendación go / no-go.',
        gate: '¿Está lista para producción, ajuste o escalamiento?',
      },
      {
        number: '06',
        phase: 'deploy',
        short: 'Activamos',
        title: 'Activamos y gestionamos adopción',
        kicker: 'Go-live, change management y hypercare',
        description:
          'Lanzamos con un plan formal de gestión del cambio: stakeholder map, champions internos, training por rol, comunicación, manuales rápidos, métricas de adopción, feedback loop y soporte hypercare las primeras semanas. El objetivo no es desplegar tecnología — es lograr uso real y sostenido.',
        deliverable: 'Go-live plan, documentación, training, plan de adopción, matriz RACI, soporte hypercare.',
        gate: '¿El equipo está preparado para operar y adoptar la solución?',
      },
      {
        number: '07',
        phase: 'deploy',
        short: 'Acompañamos',
        title: 'Acompañamos, medimos y evolucionamos',
        kicker: 'Soporte continuo, mejora y nuevas oportunidades',
        description:
          'Después del go-live monitoreamos desempeño, adopción, valor generado, incidentes y nuevas oportunidades. La solución evoluciona con el negocio, los datos, los usuarios y la tecnología. Revisamos resultados periódicamente y ajustamos el roadmap evolutivo.',
        deliverable: 'Support plan, tablero de métricas, roadmap evolutivo, revisiones trimestrales.',
        gate: '¿Cómo seguimos generando valor después del lanzamiento?',
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
