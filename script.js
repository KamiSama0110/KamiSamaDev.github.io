const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeToggleLabel = document.querySelector('.theme-toggle-label');
const reveals = document.querySelectorAll('.reveal');
const yearElement = document.getElementById('year');

root.classList.remove('no-js');

const getSystemPreference = () =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

const getInitialTheme = () => localStorage.getItem('portfolio-theme') || getSystemPreference();
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  if (themeToggleLabel && themeToggle) {
    const nextLabel = theme === 'dark' ? 'Light mode' : 'Dark mode';
    themeToggleLabel.textContent = nextLabel;
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', `Switch to ${nextLabel.toLowerCase()}`);
  }
};

const animateThemeTransition = (theme, x, y) => {
  if (!document.startViewTransition || prefersReducedMotion) {
    localStorage.setItem('portfolio-theme', theme);
    applyTheme(theme);
    return;
  }

  const transition = document.startViewTransition(() => {
    localStorage.setItem('portfolio-theme', theme);
    applyTheme(theme);
  });

  transition.ready.then(() => {
    const right = window.innerWidth - x;
    const bottom = window.innerHeight - y;
    const endRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
      },
      {
        duration: 540,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        pseudoElement: '::view-transition-new(root)'
      }
    );
  });
};

const toggleTheme = (event) => {
  const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  const toggleBounds = themeToggle?.getBoundingClientRect();
  const x = event?.clientX ?? (toggleBounds ? toggleBounds.left + toggleBounds.width / 2 : window.innerWidth / 2);
  const y = event?.clientY ?? (toggleBounds ? toggleBounds.top + toggleBounds.height / 2 : window.innerHeight / 2);

  animateThemeTransition(nextTheme, x, y);
};

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

applyTheme(getInitialTheme());

const revealItems = (items) => {
  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 300)}ms`;
    item.classList.add('is-visible');
  });
};

if (!('IntersectionObserver' in window)) {
  revealItems(reveals);
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  reveals.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 300)}ms`;
    revealObserver.observe(item);
  });
}

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}
