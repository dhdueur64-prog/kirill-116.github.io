(function () {
  'use strict';

  // ===== Theme Toggle =====
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  function getPreferredTheme() {
    const stored = localStorage.getItem('worktools-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('worktools-theme', theme);
    const icon = themeToggle.querySelector('.theme-toggle__icon');
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  setTheme(getPreferredTheme());

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ===== Search & Filter =====
  const searchInput = document.getElementById('searchInput');
  const filterChips = document.getElementById('filterChips');
  const categories = document.querySelectorAll('.category');
  const toolCards = document.querySelectorAll('.tool-card');

  let activeCategory = 'all';
  let searchQuery = '';

  function normalize(str) {
    return (str || '').toLowerCase().trim();
  }

  function filterTools() {
    const query = normalize(searchQuery);

    categories.forEach((cat) => {
      const catType = cat.dataset.category;
      const cards = cat.querySelectorAll('.tool-card');
      let visibleCount = 0;

      cards.forEach((card) => {
        const title = normalize(card.querySelector('.tool-card__title')?.textContent);
        const desc = normalize(card.querySelector('.tool-card__desc')?.textContent);
        const tags = normalize(card.dataset.tags);

        const matchesSearch =
          !query ||
          title.includes(query) ||
          desc.includes(query) ||
          tags.includes(query);

        const matchesCategory =
          activeCategory === 'all' || catType === activeCategory;

        if (matchesSearch && matchesCategory) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      // Hide empty categories
      if (visibleCount === 0 || (activeCategory !== 'all' && catType !== activeCategory)) {
        cat.classList.add('hidden');
      } else {
        cat.classList.remove('hidden');
      }
    });
  }

  // Chip clicks
  filterChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    filterChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('chip--active'));
    chip.classList.add('chip--active');
    activeCategory = chip.dataset.category;
    filterTools();
  });

  // Search input
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = searchInput.value;
      filterTools();
    }, 180);
  });

  // Keyboard shortcut: / to focus search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });
})();
