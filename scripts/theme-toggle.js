(function() {
  'use strict';

  const STORAGE_KEY = 'theme-preference';

  function getThemePreference() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleButton(theme);
  }

  /**
   * Update the toggle button icon based on current theme
   */
  function updateToggleButton(theme) {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;

    const lightIcon = button.querySelector('[data-icon="light"]');
    const darkIcon = button.querySelector('[data-icon="dark"]');

    if (lightIcon && darkIcon) {
      if (theme === 'dark') {
        lightIcon.style.display = 'block';
        darkIcon.style.display = 'none';
        button.setAttribute('aria-label', 'Switch to light mode');
      } else {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'block';
        button.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getThemePreference();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }

  /**
   * Initialize theme on page load
   */
  function initTheme() {
    const theme = getThemePreference();
    applyTheme(theme);
  }

  // Apply theme immediately to prevent flash
  initTheme();

  document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.addEventListener('click', toggleTheme);
    }
    updateToggleButton(getThemePreference());
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

})();

