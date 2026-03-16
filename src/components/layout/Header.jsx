export default function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-border bg-black/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-text-primary">
          Evandro Ripka
        </div>

        <nav className="hidden gap-6 text-sm md:flex">
          <a href="#projects" className="text-text-secondary transition hover:text-text-primary">
            Projects
          </a>
          <a href="#about" className="text-text-secondary transition hover:text-text-primary">
            About
          </a>
          <a href="#journey" className="text-text-secondary transition hover:text-text-primary">
            Journey
          </a>
          <a href="#contact" className="text-text-secondary transition hover:text-text-primary">
            Contact
          </a>
        </nav>
      </div>
    </header>
  )
}