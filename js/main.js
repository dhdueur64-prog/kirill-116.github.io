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
    const icon = themeToggle && themeToggle.querySelector('.theme-toggle__icon');
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  if (themeToggle) {
    setTheme(getPreferredTheme());
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ===== Search & Filter =====
  const searchInput = document.getElementById('searchInput');
  const filterChips = document.getElementById('filterChips');
  const categories = document.querySelectorAll('.category');

  let activeCategory = 'all';
  let searchQuery = '';

  function normalize(str) {
    return (str || '').toLowerCase().trim();
  }

  function filterTools() {
    if (!categories.length) return;
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

      if (visibleCount === 0 || (activeCategory !== 'all' && catType !== activeCategory)) {
        cat.classList.add('hidden');
      } else {
        cat.classList.remove('hidden');
      }
    });
  }

  if (filterChips) {
    filterChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      filterChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('chip--active'));
      chip.classList.add('chip--active');
      activeCategory = chip.dataset.category;
      filterTools();
    });
  }

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = searchInput.value;
        filterTools();
      }, 180);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !e.target.closest('input, textarea, select')) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // ===== Feedback modal =====
  const feedbackBtn = document.getElementById('feedbackOpen');
  const feedbackModal = document.getElementById('feedbackModal');
  const feedbackClose = document.getElementById('feedbackClose');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackStatus = document.getElementById('feedbackStatus');
  const feedbackSubmit = document.getElementById('feedbackSubmit');

  function openFeedback(preselectTool) {
    if (!feedbackModal) return;
    feedbackModal.classList.add('is-open');
    feedbackModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (preselectTool && feedbackForm) {
      const sel = feedbackForm.querySelector('[name="tool"]');
      if (sel) sel.value = preselectTool;
    }
    if (feedbackStatus) {
      feedbackStatus.textContent = '';
      feedbackStatus.className = 'feedback-status';
    }
  }

  function closeFeedback() {
    if (!feedbackModal) return;
    feedbackModal.classList.remove('is-open');
    feedbackModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (feedbackBtn) feedbackBtn.addEventListener('click', () => openFeedback());
  if (feedbackClose) feedbackClose.addEventListener('click', closeFeedback);

  if (feedbackModal) {
    feedbackModal.addEventListener('click', (e) => {
      if (e.target === feedbackModal) closeFeedback();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && feedbackModal.classList.contains('is-open')) closeFeedback();
    });
  }

  document.querySelectorAll('[data-open-feedback]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openFeedback(el.dataset.tool || '');
    });
  });

  async function sendFeedback(fields) {
    const c = window.WORKTOOLS_CONFIG || {};
    const payload = {
      type: 'feedback',
      _subject: `[WorkTools] ${fields.kind || 'feedback'}: ${(fields.message || '').slice(0, 60)}`,
      kind: fields.kind || 'other',
      tool: fields.tool || '',
      message: fields.message || '',
      contact: fields.contact || '',
      path: location.pathname,
      ts: new Date().toISOString(),
    };

    if (c.endpoint) {
      const res = await fetch(c.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Ошибка отправки (' + res.status + ')');
      return { method: 'endpoint' };
    }

    if (c.feedbackEmail) {
      const subject = encodeURIComponent(payload._subject);
      const body = encodeURIComponent(
        `Тип: ${payload.kind}\nИнструмент: ${payload.tool || '—'}\n\n${payload.message}\n\nКонтакт: ${payload.contact || '—'}\nСтраница: ${payload.path}\nВремя: ${payload.ts}`
      );
      window.location.href = `mailto:${c.feedbackEmail}?subject=${subject}&body=${body}`;
      return { method: 'mailto' };
    }

    return { method: 'none' };
  }

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(feedbackForm);
      const fields = {
        kind: fd.get('kind') || 'other',
        tool: fd.get('tool') || '',
        message: (fd.get('message') || '').toString().trim(),
        contact: (fd.get('contact') || '').toString().trim(),
      };

      if (!fields.message || fields.message.length < 5) {
        if (feedbackStatus) {
          feedbackStatus.textContent = 'Напишите чуть подробнее (минимум несколько слов).';
          feedbackStatus.className = 'feedback-status feedback-status--error';
        }
        return;
      }

      if (feedbackSubmit) {
        feedbackSubmit.disabled = true;
        feedbackSubmit.textContent = 'Отправка…';
      }

      try {
        const result = await sendFeedback(fields);

        if (feedbackStatus) {
          if (result.method === 'none') {
            feedbackStatus.textContent =
              'Не настроен приём сообщений. Укажите endpoint или feedbackEmail в js/config.js.';
            feedbackStatus.className = 'feedback-status feedback-status--warn';
          } else if (result.method === 'mailto') {
            feedbackStatus.textContent = 'Откроется почтовый клиент для отправки.';
            feedbackStatus.className = 'feedback-status feedback-status--ok';
          } else {
            feedbackStatus.textContent = 'Спасибо! Сообщение отправлено.';
            feedbackStatus.className = 'feedback-status feedback-status--ok';
            feedbackForm.reset();
            setTimeout(closeFeedback, 1400);
          }
        }
      } catch (err) {
        if (feedbackStatus) {
          feedbackStatus.textContent = 'Не удалось отправить: ' + (err.message || 'ошибка сети');
          feedbackStatus.className = 'feedback-status feedback-status--error';
        }
      } finally {
        if (feedbackSubmit) {
          feedbackSubmit.disabled = false;
          feedbackSubmit.textContent = 'Отправить';
        }
      }
    });
  }

  window.WorkToolsFeedback = { open: openFeedback, close: closeFeedback };
})();
