import Button from '../ui/Button'

const navItems = [
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Journey', href: '#journey' },
  { label: 'Contact', href: '#contact' },
]

export default function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full px-4 pt-4">
      <div className="mx-auto flex max-w-content items-center justify-between rounded-full border border-border bg-black/30 px-6 py-4 backdrop-blur-xl">
        <a
          href="/"
          className="group inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-text-primary"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent shadow-glow" />
          <span className="transition group-hover:text-accent">
            Evandro Ripka
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-text-secondary transition hover:text-text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button as="a" href="#contact" variant="secondary" className="px-5 py-2.5">
            Let’s Talk
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-primary transition hover:bg-white/5 md:hidden"
          aria-label="Open menu"
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
          </span>
        </button>
      </div>
    </header>
  )
}