export default {
  nav: {
    services: 'Services',
    process: 'Process',
    team: 'Our Team',
    skills: 'Skills',
    research: 'Research',
    contact: 'Contact Us',
  },
  hero: {
    title: 'We drive software & AI solutions for real businesses',
    subtitle:
      'Technical consulting, software development, AI implementation, and specialized training by a top-tier team.',
    cta: "Let's Talk",
    ctaSecondary: 'Meet the Team',
  },
  services: {
    title: 'What We Do',
    subtitle: 'We combine deep technical expertise with strategic vision to deliver real value.',
    items: [
      {
        title: 'Software Development Consulting',
        description:
          'We design and guide scalable, maintainable technical solutions aligned with your business goals.',
        details: [
          'Solution architecture',
          'Technical design',
          'System modernization',
          'Technology decision support',
        ],
      },
      {
        title: 'AI Solutions Implementation',
        description:
          'We build and integrate intelligent solutions to automate processes and generate real value.',
        details: [
          'Intelligent automation',
          'AI model integration',
          'AI-assisted systems',
          'Custom business solutions',
        ],
      },
      {
        title: 'Specialized Training',
        description:
          'We train teams in artificial intelligence, software development, and advanced technical practices.',
        details: [
          'Technical workshops',
          'Team training',
          'AI & architecture mentoring',
          'Client-level adapted programs',
        ],
      },
    ],
  },
  process: {
    eyebrow: 'Client Value Delivery Framework',
    title: 'How we work',
    subtitle:
      'We turn real business challenges into measurable, adoptable, and sustainable solutions. Seven stages, three phases, and a clear decision gate at the end of every step — to protect your investment.',
    phasesLabel: 'Framework phases',
    phases: [
      {
        id: 'discovery',
        tag: 'Phase 1',
        title: 'Discovery & Assessment',
        description:
          'Understand the problem, evaluate technical maturity, risk, and economic opportunity before committing resources.',
      },
      {
        id: 'design',
        tag: 'Phase 2',
        title: 'Design & Build',
        description:
          'Co-design the blueprint, build an MVP in short sprints, and validate with technical, functional, and business evidence.',
      },
      {
        id: 'deploy',
        tag: 'Phase 3',
        title: 'Deploy & Evolve',
        description:
          'Launch with change management, measure adoption and value generated, and evolve with the business.',
      },
    ],
    stagesLabel: 'The 7 stages',
    deliverableLabel: 'Deliverable',
    gateLabel: 'Decision gate',
    stages: [
      {
        number: '01',
        phase: 'discovery',
        short: 'Listen',
        title: 'We listen and understand',
        kicker: 'Initial conversation · no commitment',
        description:
          'Initial session to understand the business context, the core problem, strategic objectives, and current constraints. We identify whether the challenge requires consulting, automation, AI, training — or a combination.',
        deliverable: 'Initial Problem Brief with objectives, constraints, and success criteria.',
        gate: 'Is there a clear, relevant problem worth exploring?',
      },
      {
        number: '02',
        phase: 'discovery',
        short: 'Diagnose',
        title: 'We diagnose opportunity, maturity, and risk',
        kicker: 'Technical, business, and data assessment',
        description:
          'We evaluate processes, data, architecture, tools, team capabilities, operational risks, and automation opportunities. We build a Business Value Case quantifying expected value, operational savings, financial impact, risk reduction, and required investment.',
        deliverable: 'Assessment Report, impact/effort map, risk register, business value case.',
        gate: 'Is it worth investing? What is the best path forward?',
      },
      {
        number: '03',
        phase: 'design',
        short: 'Design',
        title: 'We design the solution blueprint',
        kicker: 'Co-creation of architecture and plan',
        description:
          'We co-create the target architecture, functional scope, user experience, AI agent behavior, integrations, success metrics, risks, and governance plan. Before we build, we define what success means and how we will measure it.',
        deliverable: 'Solution Blueprint, roadmap, initial backlog, KPIs, acceptance criteria, governance plan.',
        gate: 'What do we build, how do we measure it, and which risks do we control?',
      },
      {
        number: '04',
        phase: 'design',
        short: 'Build',
        title: 'We pilot and build in short cycles',
        kicker: 'MVP, sprints, demos, and feedback',
        description:
          'We execute in short sprints with frequent demos and continuous feedback. We prioritize a functional MVP or pilot that lets us validate value with real users, data, and processes before scaling. We apply modern testing, CI/CD and — when AI is involved — MLOps and model monitoring.',
        deliverable: 'Functional MVP/pilot, initial integrations, refined backlog, executive demos.',
        gate: 'Does the solution show enough value to scale?',
      },
      {
        number: '05',
        phase: 'design',
        short: 'Validate',
        title: 'We validate with evidence',
        kicker: 'Multidimensional validation · go / no-go',
        description:
          'We validate against technical, functional, operational, financial, adoption, and risk metrics. For AI projects we also evaluate accuracy, traceability, explainability, bias, security, and the need for human oversight.',
        deliverable: 'Validation Report, KPI results, residual risks, go / no-go recommendation.',
        gate: 'Is it ready for production, adjustment, or scaling?',
      },
      {
        number: '06',
        phase: 'deploy',
        short: 'Activate',
        title: 'We activate and manage adoption',
        kicker: 'Go-live, change management, and hypercare',
        description:
          'We launch with a formal change management plan: stakeholder map, internal champions, role-based training, communication, quick reference guides, adoption metrics, feedback loop, and hypercare support during the first weeks. The goal is not deploying technology — it is achieving real, sustained use.',
        deliverable: 'Go-live plan, documentation, training, adoption plan, RACI matrix, hypercare support.',
        gate: 'Is the team ready to operate and adopt the solution?',
      },
      {
        number: '07',
        phase: 'deploy',
        short: 'Evolve',
        title: 'We support, measure, and evolve',
        kicker: 'Ongoing support, improvement, and new opportunities',
        description:
          'After go-live we monitor performance, adoption, value generated, incidents, and new opportunities. The solution evolves with the business, the data, the users, and the technology. We review results periodically and adjust the evolutionary roadmap.',
        deliverable: 'Support plan, metrics dashboard, evolutionary roadmap, quarterly reviews.',
        gate: 'How do we keep generating value after launch?',
      },
    ],
    governance: {
      eyebrow: 'Cross-cutting layer',
      title: 'Governance, Security & Responsible AI',
      subtitle: 'Applied across every stage — not as an optional step at the end.',
      pillars: [
        { title: 'Data privacy', description: 'Classification and handling of sensitive data per regulation.' },
        { title: 'Security & access', description: 'Access control, encryption, audit, and traceability.' },
        { title: 'Model risk', description: 'Bias, fairness, and robustness evaluation.' },
        { title: 'Human-in-the-loop', description: 'Human oversight on critical decisions.' },
        { title: 'Explainability', description: 'Transparency in how the agent makes decisions.' },
        { title: 'Prompt security', description: 'Protection against injection and abuse.' },
        { title: 'Continuous monitoring', description: 'Drift and degradation detection post go-live.' },
        { title: 'Usage policy', description: 'Acceptable-use framework and clear accountability.' },
        { title: 'Compliance', description: 'Auditable documentation at every stage.' },
      ],
    },
    modalities: {
      title: 'Ways to start',
      subtitle: 'Three ways to begin — pick the one that matches your organization right now.',
      items: [
        {
          name: 'Advisory Sprint',
          tag: 'Fast diagnosis',
          duration: '1 – 2 weeks',
          description:
            'For clients who need clarity before investing. Accelerated diagnosis of opportunity, risk, and path forward.',
          outcomeLabel: 'Outcome',
          outcome: 'Roadmap, prioritized opportunities, identified risks, and quick wins.',
        },
        {
          name: 'Pilot / MVP Build',
          tag: 'Prove real value',
          duration: '4 – 8 weeks',
          description:
            'For clients who want to validate a solution with real data and users before committing to a full implementation.',
          outcomeLabel: 'Outcome',
          outcome: 'Functional prototype, initial metrics, validated business case, and scaling plan.',
        },
        {
          name: 'Implementation & Scale',
          tag: 'Production and operation',
          duration: '8 – 16+ weeks',
          description:
            'For clients ready to take the solution to production with full quality, adoption, and operational controls.',
          outcomeLabel: 'Outcome',
          outcome: 'Operational solution, documentation, training, monitoring, and ongoing support.',
        },
      ],
    },
    cta: "Let's talk about your challenge",
  },
  team: {
    title: 'Who We Are',
    subtitle:
      'We help businesses design, build, and deploy AI-powered software solutions focused on solving real-world challenges.\n\nOur team brings deep expertise in artificial intelligence, software architecture, and product strategy. We automate processes, optimize operations, and build scalable digital products that drive measurable impact.\n\nWe work alongside our clients to turn ideas into concrete solutions and reduce technological complexity at every stage of growth.',
    members: [
      {
        name: 'Marxjhony Jerez',
        role: 'CEO · PhD in Applied Sciences',
        description:
          'Strategic leader in tech consulting with deep expertise in AI, software development, data analytics, and process automation. He turns complex challenges into solutions that drive operational efficiency and competitive advantage. Combines business vision, agile leadership, and technical expertise to build smarter, scalable organizations.',
        skills: ['Digital Strategy', 'AI', 'Project Management', 'Automation', 'Software Developer', 'Agents', 'Product Manager'],
      },
      {
        name: 'Angel Gil',
        role: 'COO · PhD in Applied Sciences',
        description:
          'AI and robotics specialist with expertise in software development, DevOps, and product leadership. Designs scalable tech solutions that solve real business problems, combining technical architecture with strategic vision. Passionate about technology and animal welfare.',
        skills: ['AI', 'Robotics', 'Product', 'DevOps', 'Software Developer', 'Agents', 'Tech Lead'],
      },
      {
        name: 'Ricardo Dos Santos',
        role: 'CTO · PhD in Applied Sciences',
        description:
          'AI software development specialist with deep research expertise in Big Data, Machine Learning, and Social Analytics. Architects intelligent, data-driven environments using Semantic Mining and Linked Data to transform complex datasets into actionable business insights. Combines rigorous analytical thinking with a strategic approach to building scalable solutions.',
        skills: ['AI', 'Big Data', 'Machine Learning', 'Semantic Mining', 'Linked Data', 'Ambient Intelligence', 'Software Developer', 'Agents', 'Solutions Architect'],
      },
    ],
  },
  skills: {
    title: 'Skills & Expertise',
    subtitle: 'A snapshot of the capabilities and domains we operate across.',
    categories: [
      {
        label: 'AI & Data',
        items: [
          'LLMs',
          'RAG',
          'Machine Learning',
          'MLOps',
          'Data Analytics',
          'Generative AI',
          'Prompt Engineering',
          'Computer Vision',
          'NLP',
          'Agentic AI',
        ],
      },
      {
        label: 'Engineering',
        items: [
          'Software Development',
          'DevOps',
          'Cloud Architecture',
          'Microservices',
          'Solution Architecture',
        ],
      },
      {
        label: 'Operations',
        items: [
          'Automation',
          'Process Optimization',
          'Project Management',
          'Agile',
        ],
      },
      {
        label: 'Industries',
        items: [
          'Energy',
          'Healthcare',
          'Finance',
          'Marketing',
          'Retail',
          'Manufacturing',
          'Education',
          'Logistics',
          'Sports',
        ],
      },
    ],
  },
  research: {
    title: 'Research',
    subtitle:
      'We know that delivering solutions starts with understanding the fundamentals — so we research continuously and apply what we learn to real-world cases. Here is a glimpse of that work.',
    readMore: 'Read more',
    close: 'Close',
    reference: 'Reference',
    ctaTitle: 'Want to apply this to your business?',
    ctaSubtitle: "Tell us about your challenge and we'll help you scope a clear, viable solution.",
    ctaButton: "Let's talk",
  },
  ctaBanner: {
    title: "Let's build something together",
    subtitle: "Tell us about your challenge — we'll help you scope a clear, viable solution.",
    cta: 'Start a conversation',
  },
  contact: {
    title: 'Contact Us',
    subtitle:
      'Tell us your challenge and we\'ll help you define a clear, viable, and scalable solution.',
    form: {
      name: 'Name',
      email: 'Email',
      company: 'Company (optional)',
      message: 'Message',
      submit: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully! We\'ll get back to you soon.',
      error: 'Something went wrong. Please try again or email us directly.',
    },
  },
  footer: {
    rights: '© 2026 Agentic-AMR Consultants. All rights reserved.',
    tagline: 'AI consulting, automation, and software development for businesses ready to scale.',
  },
}
