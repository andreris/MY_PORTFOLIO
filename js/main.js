const body = document.body;
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');
const themeButton = document.querySelector('.theme-button');

const pages = { home: 'index.html', projects: 'proyectos.html', about: 'sobre-mi.html', contact: 'contacto.html' };
document.querySelectorAll('.site-nav a').forEach(link => {
  if (link.getAttribute('href') === pages[body.dataset.page]) link.classList.add('active');
});

menuButton?.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? '✕' : '☰';
});

document.addEventListener('click', event => {
  if (navigation?.classList.contains('open') && !navigation.contains(event.target) && !menuButton.contains(event.target)) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = '☰';
  }
});

const runModeButton = document.querySelector('.run-mode');
const themeStatus = document.querySelector('#theme-status');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function renderTheme() {
  const dark = body.classList.contains('dark');
  localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light');
  themeButton?.setAttribute('aria-pressed', String(dark));
  runModeButton?.setAttribute('aria-pressed', String(dark));
  if (runModeButton) runModeButton.textContent = dark ? '› Light mode' : '› Dark mode';
  if (themeStatus) themeStatus.textContent = dark ? 'TRUE' : 'FALSE';
}

function setTheme(nextDark, animate = true, sourceButton = null) {
  if (body.classList.contains('dark') === nextDark) {
    renderTheme();
    return;
  }

  const applyTheme = () => {
    body.classList.toggle('dark', nextDark);
    renderTheme();
  };

  if (!animate || reduceMotion.matches) {
    applyTheme();
    return;
  }

  const sourceRect = sourceButton?.getBoundingClientRect();
  const originX = sourceRect ? sourceRect.left + sourceRect.width / 2 : window.innerWidth / 2;
  const originY = sourceRect ? sourceRect.top + sourceRect.height / 2 : window.innerHeight / 2;

  body.style.setProperty('--theme-wipe-x', originX + 'px');
  body.style.setProperty('--theme-wipe-y', originY + 'px');
  body.style.setProperty('--theme-wipe-color', nextDark ? '#071018' : '#e3decf');
  body.classList.remove('theme-wipe');
  void body.offsetWidth;
  body.classList.add('theme-wipe');
  window.setTimeout(applyTheme, 620);
  window.setTimeout(() => body.classList.remove('theme-wipe'), 1020);
}

setTheme(localStorage.getItem('portfolio-theme') === 'dark', false);
themeButton?.addEventListener('click', event => setTheme(!body.classList.contains('dark'), true, event.currentTarget));
runModeButton?.addEventListener('click', event => setTheme(!body.classList.contains('dark'), true, event.currentTarget));

document.querySelectorAll('[data-year]').forEach(element => element.textContent = new Date().getFullYear());

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.case-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && !card.dataset.category.includes(filter));
    });
  });
});

document.querySelectorAll('.details-button').forEach(button => {
  button.addEventListener('click', () => {
    const details = button.closest('.case-copy').querySelector('.extra-details');
    details.hidden = !details.hidden;
    button.textContent = details.hidden ? 'Ver detalles' : 'Ocultar detalles';
  });
});


/* Contact form: real delivery with inline status */
const contactForm = document.querySelector('#contact-form');

contactForm?.addEventListener('submit', async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('.submit-button');
  const originalLabel = 'Enviar correo';
  const payload = Object.fromEntries(new FormData(form).entries());

  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  submitButton.textContent = 'Enviando…';

  try {
    const response = await fetch('https://formsubmit.co/ajax/andre.rivera108@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('No se pudo enviar el formulario');

    form.reset();
    submitButton.textContent = '✓ Correo enviado';
    submitButton.classList.add('is-sent');

    window.setTimeout(() => {
      submitButton.textContent = originalLabel;
      submitButton.classList.remove('is-sent');
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }, 5000);
  } catch (error) {
    submitButton.textContent = 'Error — reintentar';
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');

    window.setTimeout(() => {
      submitButton.textContent = originalLabel;
    }, 5000);
  }
});


/* Home runtime: Lima clock and coffee pipeline */
const limaClock = document.querySelector('#lima-time');

function updateLimaClock() {
  if (!limaClock) return;
  limaClock.textContent = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
}

updateLimaClock();
if (limaClock) window.setInterval(updateLimaClock, 1000);

const coffeeButton = document.querySelector('.run-coffee');
const coffeeMachine = document.querySelector('.pixel-machine');
const coffeePercent = document.querySelector('.coffee-percent');
const coffeeProgress = document.querySelector('.coffee-progress span');
const coffeeLiquid = document.querySelector('.coffee-liquid');
let coffeeFrame = 0;
let readyLabelTimer = 0;
let serveStartTimer = 0;
let coffeeGrabTimer = 0;
let serveEndTimer = 0;
let newCupTimer = 0;

function renderCoffee(value) {
  const percentage = Math.max(0, Math.min(100, Math.round(value)));
  const padded = String(percentage).padStart(3, '0');
  if (coffeePercent) coffeePercent.textContent = padded + '%';
  if (coffeeProgress) coffeeProgress.style.width = percentage + '%';
  if (coffeeLiquid) coffeeLiquid.style.height = Math.round(percentage * 0.58) + '%';
  if (coffeeButton) coffeeButton.textContent = percentage < 100 ? '› Brewing ' + padded + '%' : '› Coffee ready';
}

function resetMachineDisplay() {
  if (coffeePercent) coffeePercent.textContent = '000%';
  if (coffeeProgress) coffeeProgress.style.width = '0%';
}

function runCoffee() {
  if (!coffeeMachine || !coffeeButton || ['brewing', 'ready', 'serving'].includes(coffeeMachine.dataset.coffeeState)) return;

  window.cancelAnimationFrame(coffeeFrame);
  [readyLabelTimer, serveStartTimer, coffeeGrabTimer, serveEndTimer, newCupTimer].forEach(window.clearTimeout);
  coffeeMachine.classList.remove('is-done', 'is-serving', 'is-served', 'is-new-cup');
  coffeeMachine.classList.add('is-brewing');
  coffeeMachine.dataset.coffeeState = 'brewing';
  coffeeButton.setAttribute('aria-busy', 'true');
  coffeeButton.disabled = true;
  renderCoffee(0);

  if (reduceMotion.matches) {
    renderCoffee(100);
    if (coffeePercent) coffeePercent.textContent = 'READY';
    coffeeMachine.classList.remove('is-brewing');
    coffeeMachine.classList.add('is-done');
    coffeeMachine.dataset.coffeeState = 'served';
    coffeeButton.removeAttribute('aria-busy');
    coffeeButton.disabled = false;
    coffeeButton.textContent = '› Run coffee';
    return;
  }

  const startedAt = performance.now();
  const duration = 4600;

  function brewFrame(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    renderCoffee(progress * 100);

    if (progress < 1) {
      coffeeFrame = window.requestAnimationFrame(brewFrame);
      return;
    }

    coffeeMachine.classList.remove('is-brewing');
    coffeeMachine.classList.add('is-done');
    coffeeMachine.dataset.coffeeState = 'ready';
    coffeeButton.textContent = '› Coffee ready';

    readyLabelTimer = window.setTimeout(() => {
      if (coffeePercent) coffeePercent.textContent = 'READY';
    }, 180);

    serveStartTimer = window.setTimeout(() => {
      coffeeMachine.classList.remove('is-done');
      coffeeMachine.classList.add('is-serving');
      coffeeMachine.dataset.coffeeState = 'serving';
      coffeeButton.textContent = '› Serving coffee';

      coffeeGrabTimer = window.setTimeout(() => {
        resetMachineDisplay();
      }, 600);

      serveEndTimer = window.setTimeout(() => {
        if (coffeeLiquid) coffeeLiquid.style.height = '0%';
        coffeeMachine.classList.remove('is-serving');
        coffeeMachine.classList.add('is-new-cup');
        coffeeMachine.dataset.coffeeState = 'idle';
        coffeeButton.removeAttribute('aria-busy');
        coffeeButton.disabled = false;
        coffeeButton.textContent = '› Run coffee';

        newCupTimer = window.setTimeout(() => {
          coffeeMachine.classList.remove('is-new-cup');
        }, 360);
      }, 1500);
    }, 700);
  }

  coffeeFrame = window.requestAnimationFrame(brewFrame);
}

coffeeButton?.addEventListener('click', runCoffee);
