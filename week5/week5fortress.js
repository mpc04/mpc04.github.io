// Navigation Toggle Logic
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !isExpanded);
  navMenu.classList.toggle('show');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
    navMenu.classList.remove('show');
    navToggle.setAttribute('aria-expanded', false);
  }
});

// Theme Switching Logic

const themeToggle = document.getElementById('theme-toggle');

/**
 * Sets the theme class on the body and saves the preference to localStorage.
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
    // Apply the theme class to the <body> element 
    document.body.className = theme; 
    
    // Save the user's theme choice for data integration 
    localStorage.setItem('userTheme', theme); 
}

/**
 * Toggles the current theme and updates the local storage.
 */
function toggleTheme() {
    const currentTheme = document.body.className === 'dark' ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

/**
 * Loads the saved theme on page load.
 */
function loadTheme() {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('userTheme') || 'light';
    setTheme(savedTheme);
}

// Event listener for the theme toggle button (on all pages)
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Load the theme when the page is fully loaded
window.addEventListener('load', loadTheme);
