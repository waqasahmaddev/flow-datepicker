const toggle = document.getElementById('themeToggle');
const root = document.documentElement;

function currentTheme() {
  return root.getAttribute('data-fdp-theme') === 'light' ? 'light' : 'dark';
}

function showTheme() {
  toggle.textContent = currentTheme() === 'dark' ? 'Light mode' : 'Dark mode';
}

toggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-fdp-theme', next);
  try {
    localStorage.setItem('fdp-demo-theme', next);
  } catch (e) {
  }
  showTheme();
});

showTheme();
