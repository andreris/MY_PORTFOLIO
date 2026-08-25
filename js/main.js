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

if (localStorage.getItem('portfolio-theme') === 'dark') body.classList.add('dark');
themeButton?.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('portfolio-theme', body.classList.contains('dark') ? 'dark' : 'light');
});

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

document.querySelector('#contact-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`${data.get('subject')} — ${data.get('name')}`);
  const message = encodeURIComponent(`Nombre: ${data.get('name')}\nCorreo: ${data.get('email')}\n\n${data.get('message')}`);
  window.location.href = `mailto:andre.rivera108@gmail.com?subject=${subject}&body=${message}`;
});
