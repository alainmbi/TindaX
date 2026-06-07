const initializeMobileMenu = () => {
  const mobileMenuButton = document.querySelector('[data-mobile-menu-toggle]')
  const mobileMenu = document.querySelector('[data-mobile-menu]')
  const mobileMenuBackdrop = document.querySelector('[data-mobile-menu-backdrop]')
  const mobileMenuCloseButtons = document.querySelectorAll('[data-mobile-menu-close]')

  if (mobileMenuButton && mobileMenu && mobileMenuBackdrop) {
    const toggleMenu = (shouldOpen) => {
      const isExpanded =
        typeof shouldOpen === 'boolean'
          ? shouldOpen
          : mobileMenuButton.getAttribute('aria-expanded') !== 'true'

      mobileMenuButton.setAttribute('aria-expanded', String(isExpanded))
      mobileMenu.classList.toggle('hidden', !isExpanded)
      mobileMenu.classList.toggle('flex', isExpanded)
      document.body.classList.toggle('overflow-hidden', isExpanded)
    }

    mobileMenuButton.addEventListener('click', () => toggleMenu())
    mobileMenuBackdrop.addEventListener('click', () => toggleMenu(false))

    mobileMenuCloseButtons.forEach((button) => {
      button.addEventListener('click', () => toggleMenu(false))
    })

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        toggleMenu(false)
      }
    })

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        toggleMenu(false)
      }
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMobileMenu, { once: true })
} else {
  initializeMobileMenu()
}
