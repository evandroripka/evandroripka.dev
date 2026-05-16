import { useState } from 'react'
import { navItems } from '../../data/siteContent'
import BrandMark from '../ui/BrandMark'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const isHome = window.location.pathname === '/'

  return (
    <header className="header">
      <div className="pp-container">
        <nav className="navbar custom-navbar" role="navigation" aria-label="Main Navigation">
          <div className="navbar-brand">
            <a href="/" className="navbar-item" aria-label="Evandro Ripka home">
              <BrandMark />
              <span className="name-brand first-font light-text">EVANDRO RIPKA</span>
            </a>

            <button
              type="button"
              className={['navbar-burger', isOpen ? 'is-active' : ''].filter(Boolean).join(' ')}
              aria-label="menu"
              aria-expanded={isOpen}
              aria-controls="navbar-navigation"
              onClick={() => setIsOpen((current) => !current)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>

          <div id="navbar-navigation" className={['navbar-menu', isOpen ? 'is-active' : ''].filter(Boolean).join(' ')}>
            <div className="navbar-center">
              {navItems.map((item) =>
                item.href ? (
                  <a key={item.label} className="navbar-item menu-text" href={navHref(item.href, isHome)} onClick={() => setIsOpen(false)}>
                    <span className="pp-glitch-hover">{item.label}</span>
                  </a>
                ) : (
                  <span key={item.label} className="navbar-item menu-text pp-nav-item-disabled" aria-disabled="true">
                    {item.label}
                  </span>
                ),
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

function navHref(href, isHome) {
  return href.startsWith('#') && !isHome ? `/${href}` : href
}
