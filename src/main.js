import './style.css'

/* =========================================
   Theme System — Dark Default
   Inisialisasi SEBELUM render untuk mencegah
   flash of wrong theme (FOWT)
========================================= */
;(function () {
  const saved = localStorage.getItem('theme')
  // Hanya set light jika user pernah memilih light
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  }
  // Default (tanpa saved preference) = dark, tidak perlu set apa pun
})()

/* =========================================
   Navbar — Scroll Shadow
   Pakai IntersectionObserver, bukan scroll event
   (lebih ringan di main thread)
========================================= */
const navbar = document.getElementById('navbar')

if (navbar) {
  const sentinel = document.createElement('div')
  sentinel.style.cssText = 'position:absolute;top:1px;height:1px;width:1px;pointer-events:none'
  document.body.prepend(sentinel)

  new IntersectionObserver(([entry]) => {
    navbar.classList.toggle('is-scrolled', !entry.isIntersecting)
  }, { threshold: 1 }).observe(sentinel)
}

/* =========================================
   Navbar — Hamburger Toggle (Mobile)
========================================= */
const navToggle = document.getElementById('navToggle')
const mobileMenu = document.getElementById('mobileMenu')

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open')
    navToggle.classList.toggle('is-open', isOpen)
    navToggle.setAttribute('aria-expanded', isOpen)
    mobileMenu.setAttribute('aria-hidden', !isOpen)
  })

  // Tutup menu saat link diklik
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open')
      navToggle.classList.remove('is-open')
      navToggle.setAttribute('aria-expanded', 'false')
      mobileMenu.setAttribute('aria-hidden', 'true')
    })
  })

  // Tutup menu saat klik di luar navbar
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && mobileMenu.classList.contains('is-open')) {
      mobileMenu.classList.remove('is-open')
      navToggle.classList.remove('is-open')
      navToggle.setAttribute('aria-expanded', 'false')
      mobileMenu.setAttribute('aria-hidden', 'true')
    }
  })
}

/* =========================================
   Smooth Scroll — Anchor Links
   Offset untuk sticky navbar
========================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'))
    if (!target) return
    e.preventDefault()
    const top = target.getBoundingClientRect().top + window.scrollY - (navbar?.offsetHeight ?? 56)
    window.scrollTo({ top, behavior: 'smooth' })
  })
})

/* =========================================
   Hero — Background Slideshow
   Gambar bergantian: 1.5s stay, 0.7s fade
   Tidak berjalan jika user prefer-reduced-motion
========================================= */
const slides = document.querySelectorAll('.hero__bg-slide')

if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let current = 0

  // HOLD: 1500ms + FADE: 700ms = 2200ms total per siklus
  setInterval(() => {
    slides[current].classList.remove('is-active')
    current = (current + 1) % slides.length
    slides[current].classList.add('is-active')
  }, 1500 + 700) // hold + fade duration
}

/* =========================================
   Hero — Desktop Model Pair Slideshow
   Pair 1 (first): premium enter → hold 2.2s → premium leave
   Pair 2 (second): premium enter → hold 2.2s → premium leave → repeat
   Timing: enter=1.2s, hold=2.2s, leave=0.8s
   Only runs on desktop (min-width: 769px)
========================================= */
const modelPairs = document.querySelectorAll('.hero__models-pair')

if (modelPairs.length > 1) {
  const SLIDE_IN  = 1200  // ms — matches CSS 1.2s
  const HOLD      = 2200  // ms — elegant longer hold
  const SLIDE_OUT = 800   // ms — matches CSS 0.8s


  let modelCurrent = 0

  function runModelSlideshow() {
    const pairs = modelPairs
    const current = modelCurrent
    const next = (current + 1) % pairs.length

    // Mark current pair as leaving (slide-out animation starts)
    pairs[current].classList.remove('is-active')
    pairs[current].classList.add('is-leaving')

    // After slide-out completes, hide it and start next pair
    setTimeout(() => {
      pairs[current].classList.remove('is-leaving')

      // Slide the next pair in
      pairs[next].classList.add('is-entering')

      // After slide-in completes, set it as active (stable)
      setTimeout(() => {
        pairs[next].classList.remove('is-entering')
        pairs[next].classList.add('is-active')
        modelCurrent = next

        // Hold, then trigger next cycle
        setTimeout(runModelSlideshow, HOLD)
      }, SLIDE_IN)
    }, SLIDE_OUT)
  }

  // Initial pair is already .is-active; after initial hold, start cycling
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTimeout(runModelSlideshow, HOLD)
  }
}

/* =========================================
   Theme Toggle — Dark / Light
   Shared function untuk desktop & mobile button
========================================= */
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'dark')
  }
}

function toggleTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light'
  applyTheme(isLight ? 'dark' : 'light')
}

// Desktop toggle
const themeToggle = document.getElementById('themeToggle')
if (themeToggle) themeToggle.addEventListener('click', toggleTheme)

// Mobile toggle (di dalam hamburger menu)
const themeToggleMobile = document.getElementById('themeToggleMobile')
if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme)

/* =========================================
   Social Proof Counter Animation
========================================= */
const counterInstansi = document.getElementById('counter-instansi')
const counterTerjual = document.getElementById('counter-terjual')

// Setup IntersectionObserver for trigger count up on scroll
const countUpObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target)
      observer.unobserve(entry.target) // only animate once
    }
  })
}, { threshold: 0.5 })

if (counterInstansi) countUpObserver.observe(counterInstansi)
if (counterTerjual) countUpObserver.observe(counterTerjual)

function animateCount(el) {
  const target = parseInt(el.getAttribute('data-target'), 10)
  const duration = 2000 // 2 seconds
  const fps = 60
  const totalFrames = (duration / 1000) * fps
  let currentFrame = 0

  // Easing function (easeOutExpo)
  const easeOut = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

  const counter = setInterval(() => {
    currentFrame++
    const progress = easeOut(currentFrame / totalFrames)
    const currentVal = Math.round(target * progress)

    // Format with commas: 10,000
    el.innerText = currentVal.toLocaleString('en-US')

    if (currentFrame >= totalFrames) {
      clearInterval(counter)
      el.innerText = target.toLocaleString('en-US')
      
      // Start infinite interval specific to the 'Kemeja Terjual'
      if (el.id === 'counter-terjual') {
        startInfiniteCounter(el, target)
      }
    }
  }, 1000 / fps)
}

function startInfiniteCounter(el, currentValue) {
  let val = currentValue
  // Bertambah 1 secara strict setiap 3 detik
  setInterval(() => {
    val += 1
    el.innerText = val.toLocaleString('en-US')
  }, 3000)
}
