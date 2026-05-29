/**
 * TOXIC Portfolio - Clean Animations
 * Scroll reveal, smooth transitions only
 */

(() => {
  'use strict';

  // ==========================================
  // SECTION REVEAL ON SCROLL
  // ==========================================
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.section').forEach(section => {
    sectionObserver.observe(section);
  });

  // ==========================================
  // SMOOTH SCROLL FOR NAV LINKS
  // ==========================================
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ==========================================
  // DYNAMIC PROMPT PATH ON SCROLL
  // ==========================================
  const sections = document.querySelectorAll('.section');
  const brandPath = document.querySelector('.brand-path');

  const pathMap = {
    'hero': '~',
    'projects': '~/projects',
    'skills': '~',
    'contact': '~'
  };

  const pathObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && brandPath) {
        brandPath.textContent = pathMap[entry.target.id] || '~';
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => {
    pathObserver.observe(section);
  });

  // ==========================================
  // NAV LINK ACTIVE STATE
  // ==========================================
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => {
    navObserver.observe(section);
  });

  // ==========================================
  // CONSOLE ASCII
  // ==========================================
  console.log(`%c
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║    TOXIC - Systems Developer          ║
  ║    github.com/TOX9C                   ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  `, 'color: #00ff41');

})();
