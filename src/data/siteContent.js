const imagePath = '/assets/images/'
const videoPath = '/assets/videos/'
const raisingChairPath = `${imagePath}evandro/raising-chair/`

const raisingChairFrames = Array.from({ length: 75 }, (_, index) => {
  const frameNumber = 74 - index
  const layerNumber = index + 1

  return `${raisingChairPath}RaiseUp_${String(frameNumber).padStart(4, '0')}_Layer-${layerNumber}.webp`
})

export const navItems = [
  { label: 'Who I am', href: '#about' },
  { label: 'Highlights', href: '#work' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
]

export const hero = {
  video: `${videoPath}Evandroripkawebdeveloperphplaravel-tiny.mp4`,
  title: 'Built for complex ideas.',
  subtitle: 'I turn complex ideas into solid systems and digital products.',
  cta: {
    label: 'See more',
    href: '#about',
    icon: 'down',
  },
}

export const about = {
  id: 'about',
  kicker: 'Starting with me...',
  title: 'Shaped by design, code, business, and impossible ideas.',
  image: `${imagePath}evandro_ripka_about_myself.webp`,
  imageAlt: 'Evandro Ripka',
  paragraphs: [
    'Hi, I’m Evandro Ripka, and I’m a senior developer with 12+ years of experience building web systems, digital products, and real-world user experiences.',
    'My path started in design, evolved through software development, and was shaped by building my own technology businesses. That changed how I approach every project: I do not just look at the screen or the code. I look at the product, the operation, the user, the brand, and the value the experience must create.	',
    'Today, I help teams turn complex ideas into solid systems, thoughtful interfaces, and digital experiences that feel intentional, not generic.',
  ],
}

export const highlights = {
  id: 'work',
  kicker: '',
  title: 'Selected Work',
  text: 'A selection of systems built for real operations, custom workflows, and brand-level experience, not templates.',
  cursorLabel: 'Open case',
}

export const projects = [
  {
    slug: 'bubble-clean',
    title: 'Bubble Clean',
    label: 'Operational Platform / Service Management System',
    href: '/projects/bubble-clean',
    image: '/assets/images/covers-project/bubble-clean/bubble-clean-cover.webp',
    alt: 'Bubble Clean operational platform project cover',
    icon: 'shield',
    summary:
      'An operational web platform for a cleaning company, built to manage clients, properties, staff, scheduled services, payments, before-and-after records, loyalty, referrals, and cleaner routes.',
  },
  {
    slug: 'euquero-milhas',
    title: 'EuQueroMilhas',
    label: 'Marketplace / Payments / Transaction Platform',
    href: '/projects/euquero-milhas',
    image: '/assets/images/covers-project/euqueromilhas/cover.webp',
    alt: 'EuQueroMilhas marketplace project cover',
    icon: 'layers',
    summary:
      'A marketplace designed to bring structure, trust, and operational flow to airline miles transactions that used to happen informally through WhatsApp and Telegram groups.',
  },
  {
    slug: 'pressplay-lms',
    title: 'PressPlay LMS',
    label: 'Custom LMS / WordPress Plugin / WooCommerce Platform',
    href: '/projects/pressplay-lms',
    image: '/assets/images/covers-project/pressplay-lms/pressplay-lms.webp',
    alt: 'PressPlay LMS custom learning platform project cover',
    icon: 'screen',
    summary:
      'PressPlay LMS was built for a beauty studio that needed more control over how courses were sold, delivered, and experienced - without depending on generic LMS tools.',
  },
]

export const whyMe = {
  id: 'how-it-works',
  kicker: 'How we work together',
  title: 'Clear expectations before the first line of code.',
  scene: {
    desk: `${imagePath}desktopbg.png`,
    deskAlt: '',
    chairAlt: '',
    chairFrames: raisingChairFrames,
  },
  cards: [
    {
      id: 'creative-direction',
      index: '01',
      title: 'Quality comes first',
      text: 'A limited project load keeps communication, care, and technical decisions sharp.',
      details: [
        'I work with a limited number of projects at a time, so each one gets proper attention, technical care, and consistent communication.',
      ],
      video: {
        src: `${videoPath}creative-skull.mp4`,
        opacity: 0.46,
        overlay:
          'linear-gradient(90deg, var(--bg-main) 0%, rgba(11, 15, 26, 0.9) 24%, rgba(11, 15, 26, 0.5) 58%, rgba(11, 15, 26, 0.12) 100%)',
      },
    },
    {
      id: 'technical-execution',
      index: '02',
      title: 'A surefire plan',
      text: 'Before starting, the context, constraints, priorities, timeline, and budget are clarified.',
      details: [
        'Before starting, I review the project context, current problem, timeline, priorities, and budget or rate expectations. The goal is to understand what you actually need, define what is realistic, and create a clear path for delivery.',
      ],
      video: {
        src: `${videoPath}tech-execution.mp4`,
        opacity: 0.38,
        overlay:
          'linear-gradient(90deg, var(--bg-main) 0%, rgba(11, 15, 26, 0.8) 28%, rgba(11, 15, 26, 0.36) 60%, rgba(11, 15, 26, 0.08) 100%)',
      },
    },
    {
      id: 'product-experience',
      index: '03',
      title: "It's in the bag",
      text: 'The delivery rhythm is focused, incremental, and built around long-term value.',
      details: [
        'My process is built around focused execution, incremental progress, continuous alignment, and technical review. It works best for teams that care about quality, performance, usability, and long-term value.',
        'If that sounds like the kind of partnership you are looking for, send a short brief and I will reply with the clearest next step.',
      ],
      video: {
        src: `${videoPath}product-experience.mp4`,
        opacity: 0.44,
        overlay:
          'linear-gradient(90deg, var(--bg-main) 0%, rgba(11, 15, 26, 0.88) 26%, rgba(11, 15, 26, 0.42) 56%, rgba(11, 15, 26, 0.1) 100%)',
      },
    },
  ],
}

export const contactFooter = {
  id: 'contact',
  brand: 'EVANDRO RIPKA',
  subtitle: 'Fullstack Developer',
  email: 'hi@evandroripka.dev',
  telegram: {
    label: '@evansrpka',
    href: 'https://t.me/evansrpka',
  },
  social: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/evandro-ripka-10911475/',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/evandroripka',
    },
  ],
  modalTitle: 'Tell me what you are building.',
}
