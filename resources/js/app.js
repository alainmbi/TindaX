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
      if (isExpanded) {
        mobileMenu.classList.remove('hidden')
        mobileMenu.classList.add('flex')
        mobileMenu.style.display = 'flex'
      } else {
        mobileMenu.classList.add('hidden')
        mobileMenu.classList.remove('flex')
        mobileMenu.style.display = ''
      }
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

const initializeAboutMenu = () => {
  const aboutMenuRoot = document.querySelector('[data-about-menu-root]')
  const aboutMenuToggle = document.querySelector('[data-about-menu-toggle]')
  const aboutMenu = document.querySelector('[data-about-menu]')
  const aboutChevron = document.querySelector('[data-about-menu-chevron]')

  if (aboutMenuRoot && aboutMenuToggle && aboutMenu && aboutChevron) {
    const toggleAboutMenu = (shouldOpen) => {
      const isExpanded =
        typeof shouldOpen === 'boolean'
          ? shouldOpen
          : aboutMenuToggle.getAttribute('aria-expanded') !== 'true'

      aboutMenuToggle.setAttribute('aria-expanded', String(isExpanded))
      aboutMenu.classList.toggle('hidden', !isExpanded)
      aboutChevron.classList.toggle('rotate-180', isExpanded)
    }

    aboutMenuToggle.addEventListener('click', (event) => {
      event.stopPropagation()
      toggleAboutMenu()
    })

    document.addEventListener('click', (event) => {
      if (!aboutMenuRoot.contains(event.target)) {
        toggleAboutMenu(false)
      }
    })

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        toggleAboutMenu(false)
      }
    })
  }

  const mobileAboutToggle = document.querySelector('[data-mobile-about-toggle]')
  const mobileAboutPanel = document.querySelector('[data-mobile-about-panel]')
  const mobileAboutChevron = document.querySelector('[data-mobile-about-chevron]')

  if (mobileAboutToggle && mobileAboutPanel && mobileAboutChevron) {
    const toggleMobileAbout = (shouldOpen) => {
      const isExpanded =
        typeof shouldOpen === 'boolean'
          ? shouldOpen
          : mobileAboutToggle.getAttribute('aria-expanded') !== 'true'

      mobileAboutToggle.setAttribute('aria-expanded', String(isExpanded))
      mobileAboutPanel.classList.toggle('hidden', !isExpanded)
      mobileAboutChevron.classList.toggle('rotate-180', isExpanded)
    }

    mobileAboutToggle.addEventListener('click', () => toggleMobileAbout())

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        toggleMobileAbout(false)
      }
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      initializeMobileMenu()
      initializeAboutMenu()
    },
    { once: true }
  )
} else {
  initializeMobileMenu()
  initializeAboutMenu()
}
