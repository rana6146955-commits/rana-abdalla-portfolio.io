(() => {
  const root = document.documentElement;
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const themeToggle = document.getElementById('theme-toggle');
  const progress = document.getElementById('scroll-progress');
  const hero = document.querySelector('.hero');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // RO opening animation, then reveal the portfolio hero.
  const brandIntro = document.getElementById('brandIntro');
  if (!reduceMotion && brandIntro) {
    document.body.classList.add('intro-lock');
    window.setTimeout(() => {
      brandIntro.classList.add('is-exiting');
      hero?.classList.add('loaded');
    }, 1750);
    window.setTimeout(() => {
      brandIntro.remove();
      document.body.classList.remove('intro-lock');
    }, 2450);
  } else {
    brandIntro?.remove();
    requestAnimationFrame(() => hero?.classList.add('loaded'));
  }

  // Theme
  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('rana-theme', next);
    themeToggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });

  // Mobile navigation
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  // Reveal on scroll, with light staggering for grouped elements
  const revealItems = [...document.querySelectorAll('.reveal')];
  revealItems.forEach((el, index) => {
    if (el.closest('.ach-grid')) el.style.transitionDelay = `${(index % 6) * 45}ms`;
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
        if (entry.target.classList.contains('project-card')) {
          entry.target.classList.toggle('project-active', entry.isIntersecting);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => {
      el.classList.add('in-view');
      if (el.classList.contains('project-card')) el.classList.add('project-active');
    });
  }

  // Scroll progress + nav state in one lightweight scroll callback
  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = sectionLinks
    .map(a => ({ a, el: document.querySelector(a.getAttribute('href')) }))
    .filter(item => item.el);

  let ticking = false;
  function updateScrollUI() {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 18);

    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, y / max))})`;

    const marker = y + window.innerHeight * 0.3;
    let active = sections[0];
    for (const item of sections) {
      if (item.el.offsetTop <= marker) active = item;
      else break;
    }
    sectionLinks.forEach(a => a.classList.toggle('active', active?.a === a));
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });


  updateScrollUI();
})();
