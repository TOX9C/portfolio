/**
 * TOXIC Portfolio - Terminal Theme
 * Interactive effects and animations
 */

(() => {
  'use strict';

  // ==========================================
  // Matrix Rain Background
  // ==========================================
  const canvas = document.getElementById('matrix-bg');
  const ctx = canvas.getContext('2d');

  function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  initCanvas();
  window.addEventListener('resize', initCanvas);

  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const fontSize = 14;
  const columns = () => Math.floor(canvas.width / fontSize);
  const drops = [];

  function initDrops() {
    const colCount = columns();
    drops.length = 0;
    for (let i = 0; i < colCount; i++) {
      drops[i] = Math.random() * -100;
    }
  }

  initDrops();

  function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
    const colCount = columns();

    for (let i = 0; i < colCount; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Head of the drop - brighter
      ctx.fillStyle = i % 3 === 0 ? '#00ff41' : '#00cc33';
      ctx.fillText(char, x, y);

      // Trail - dimmer
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }
  }

  let matrixInterval;
  function startMatrix() {
    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(drawMatrix, 50);
  }

  startMatrix();

  // Resize handler
  window.addEventListener('resize', () => {
    initCanvas();
    initDrops();
  });

  // ==========================================
  // Typewriter Effect
  // ==========================================
  function typewriterEffect(element, text, speed = 80) {
    let i = 0;
    element.textContent = '';

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }

    type();
  }

  // Observe typewriter elements
  const typeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.typed) {
        entry.target.dataset.typed = 'true';
        const text = entry.target.dataset.text;
        if (text) {
          typewriterEffect(entry.target, text, 60);
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.typewrite, .typewrite-cmd').forEach(el => {
    typeObserver.observe(el);
  });

  // ==========================================
  // Scroll Reveal
  // ==========================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ==========================================
  // Smooth Scroll for Nav Links
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
  // Dynamic Prompt Path on Scroll
  // ==========================================
  const sections = document.querySelectorAll('.section');

  const pathObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const brandPath = document.querySelector('.brand-path');
        if (brandPath) {
          const id = entry.target.id;
          const paths = {
            'hero': '~',
            'projects': '~/projects',
            'skills': '~',
            'contact': '~'
          };
          brandPath.textContent = paths[id] || '~';
        }
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => {
    pathObserver.observe(section);
  });

  // ==========================================
  // Console ASCII Art
  // ==========================================
  console.log(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║    TOXIC - Systems Developer          ║
  ║    github.com/TOX9C                   ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  `);

})();
