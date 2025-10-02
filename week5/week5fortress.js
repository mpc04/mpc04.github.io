const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !isExpanded);
  navMenu.classList.toggle('show');
});

// Optional: close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
    navMenu.classList.remove('show');
    navToggle.setAttribute('aria-expanded', false);
  }
});

// Keyboard support
navToggle.addEventListener('keydown', (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    navToggle.click();
  }
});

function setTheme(theme) {
    localStorage.setItem('userTheme', theme);
    document.body.className = theme;
}


window.addEventListener('load', function() {

    const savedTheme = localStorage.getItem('userTheme') || 'light';
    document.body.className = savedTheme;
});
