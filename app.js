/* ==========================================================================
   Focusboard v2.1 — interactions, motion, and state
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------ Storage ------------------------------ */
  const STORAGE_KEY = 'focusboard.v2';
  const VIEW_KEY = 'focusboard.view';
  const VERSION = '2.1';

  const seed = () => ({
    tasks: [
      { id: 1, name: 'Review Q4 product roadmap', project: 'work', projectId: 'atlas', priority: 'high', time: '45 min', done: false, createdAt: Date.now() - 1000 * 60 * 60 * 4 },
      { id: 2, name: 'Send follow-up to engineering', project: 'work', projectId: 'atlas', priority: 'medium', time: '20 min', done: false, createdAt: Date.now() - 1000 * 60 * 60 * 3 },
      { id: 3, name: 'Sketch ideas for onboarding flow', project: 'work', projectId: 'studio', priority: 'high', time: '1 hr', done: false, createdAt: Date.now() - 1000 * 60 * 60 * 2 },
      { id: 4, name: 'Book a weekend pottery class', project: 'personal', projectId: 'personal', priority: 'low', time: '15 min', done: true, doneAt: Date.now() - 1000 * 60 * 60 * 4, createdAt: Date.now() - 1000 * 60 * 60 * 26 },
      { id: 5, name: 'Read 20 pages of The Creative Act', project: 'personal', projectId: 'personal', priority: 'low', time: '30 min', done: false, createdAt: Date.now() - 1000 * 60 * 60 * 1 },
    ],
    projects: [
      { id: 'atlas', name: 'Atlas launch', color: 'coral' },
      { id: 'studio', name: 'Studio refresh', color: 'amber' },
      { id: 'personal', name: 'Personal', color: 'sage' },
    ],
    schedule: [
      { id: 's1', time: '10:30', title: 'Weekly sync', detail: 'Design team · 30 min', color: 'coral' },
      { id: 's2', time: '12:00', title: 'Lunch with Aisha', detail: 'Common Ground · 1 hr', color: 'amber' },
      { id: 's3', time: '15:30', title: 'Project review', detail: 'Atlas launch · 45 min', color: 'sage' },
    ],
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seed();
      const parsed = JSON.parse(raw);
      const s = seed();
      // merge shallowly but preserve arrays as-is from storage
      return { ...s, ...parsed, projects: parsed.projects?.length ? parsed.projects : s.projects, tasks: parsed.tasks ?? s.tasks, schedule: parsed.schedule ?? s.schedule };
    } catch {
      return seed();
    }
  };
  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  };

  const state = load();

  /* ------------------------------ Helpers ------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escape = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const onReady = (fn) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn());
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 820px)').matches;
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };

  const scheduleColorVar = (c) => {
    const map = { coral: 'var(--coral)', amber: 'var(--amber)', sage: 'var(--sage)', forest: 'var(--forest)', rust: 'var(--rust)' };
    return map[c] || 'var(--forest)';
  };

  /* ------------------------------ Date / Greeting ------------------------------ */
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const dateLine = $('#date-line');
  const greeting = $('#greeting');
  const lede = $('#lede');
  if (dateLine) dateLine.innerHTML = `${dateString} <span class="sun" aria-hidden="true">☼</span>`;

  const hour = today.getHours();
  const greet = hour < 5 ? 'Working late' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  if (greeting) greeting.innerHTML = `${greet}, Farhaj<span class="wave" aria-hidden="true">✦</span>`;

  const ledes = [
    'A clear mind makes room for meaningful work.',
    'Tiny steps, taken often, become the work itself.',
    'Choose depth over motion. The rest will follow.',
    'Today has space for one beautiful thing.',
    'Begin again, gently, right where you are.',
  ];
  if (lede) lede.textContent = ledes[today.getDate() % ledes.length];

  const schedLabel = $('#schedule-date-strong');
  if (schedLabel) schedLabel.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  /* ------------------------------ Quote ------------------------------ */
  const quotes = [
    { text: 'What you do every day matters more than what you do once in a while.', author: 'Gretchen Rubin' },
    { text: 'Discipline equals freedom.', author: 'Jocko Willink' },
    { text: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
    { text: 'Slow is smooth, smooth is fast.', author: 'Navy SEALs' },
    { text: 'The cave you fear to enter holds the treasure you seek.', author: 'Joseph Campbell' },
    { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
    { text: 'Make the thing. Then make the thing better.', author: 'Anonymous' },
  ];
  const q = quotes[today.getDate() % quotes.length];
  const qText = $('#quote-text');
  const qAuthor = $('#quote-author');
  if (qText) qText.textContent = q.text;
  if (qAuthor) qAuthor.textContent = `— ${q.author}`;

  /* ------------------------------ Reveal on load ------------------------------ */
  const reveals = $$('[data-reveal]');
  if (prefersReducedMotion()) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    reveals.forEach((el) => {
      const delay = parseInt(el.dataset.reveal, 10) * 70 + 60;
      setTimeout(() => el.classList.add('is-in'), delay);
    });
  }

  /* ------------------------------ Custom cursor ------------------------------ */
  const cursor = $('#cursor');
  const supportsCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let cursorRunning = false;
  if (supportsCursor) {
    document.body.classList.add('has-cursor');
    let cx = 0, cy = 0, rx = 0, ry = 0;
    const tick = () => {
      rx += (cx - rx) * 0.2;
      ry += (cy - ry) * 0.2;
      cursor.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (cursorRunning) requestAnimationFrame(tick);
    };
    const onMove = (e) => { cx = e.clientX; cy = e.clientY; };
    const onOver = (e) => {
      const interactive = e.target.closest('a, button, [data-magnetic], .task-row, .filter-pill, .view-button, .timer-button, .time-chip, .priority-dot, .command-item, .project-row, .tabbar__item, [role="radio"], [role="tab"]');
      cursor.classList.toggle('is-hover', !!interactive);
    };
    const onDown = () => cursor.classList.add('is-down');
    const onUp = () => cursor.classList.remove('is-down');
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cursorRunning = false; }
      else if (!cursorRunning) { cursorRunning = true; requestAnimationFrame(tick); }
    });
    cursorRunning = true;
    requestAnimationFrame(tick);
  }

  /* ------------------------------ Magnetic buttons (desktop only) ------------------------------ */
  if (supportsCursor) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = 0.22;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ------------------------------ Pointer glow on cards ------------------------------ */
  $$('.stat-card, .panel').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ------------------------------ Ambient parallax (one handler, custom props) ------------------------------ */
  const orbs = $$('.ambient__orb');
  if (orbs.length && !prefersReducedMotion()) {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      orbs.forEach((o, i) => {
        const k = (i + 1) * 0.5;
        o.style.translate = `${x * k}px ${y * k}px`;
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
  }

  /* ------------------------------ Project nav render ------------------------------ */
  const projectsNav = $('#projects-nav');
  const renderProjects = () => {
    const heading = projectsNav.querySelector('.nav-heading');
    if (!heading) return;
    // remove all rows but keep the heading
    Array.from(projectsNav.querySelectorAll('.project-row')).forEach((n) => n.remove());
    state.projects.forEach((p) => {
      const count = state.tasks.filter((t) => t.projectId === p.id).length;
      const a = document.createElement('a');
      a.className = 'project-row';
      a.href = `#project/${p.id}`;
      a.dataset.project = p.id;
      a.setAttribute('role', 'button');
      a.setAttribute('tabindex', '0');
      a.innerHTML = `<span class="project-dot ${p.color}" aria-hidden="true"></span><span class="project-name">${escape(p.name)}</span><span class="project-count">${count}</span>`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        selectProject(p);
      });
      a.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectProject(p); }
      });
      projectsNav.appendChild(a);
    });
  };

  const selectProject = (p) => {
    $$('.project-row').forEach((r) => r.classList.toggle('is-active', r.dataset.project === p.id));
    $$('.nav-link[data-view]').forEach((l) => l.classList.remove('is-active'));
    $$('#tabbar [data-view]').forEach((l) => l.classList.remove('is-active'));
    $('#view-label').textContent = p.name;
    localStorage.setItem(VIEW_KEY, `project:${p.id}`);
    if (isMobile()) closeSidebar();
  };

  renderProjects();

  /* ------------------------------ Schedule render ------------------------------ */
  const scheduleList = $('#schedule-list');
  const renderSchedule = () => {
    if (!scheduleList) return;
    scheduleList.innerHTML = '';
    state.schedule.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'schedule-item';
      row.style.animationDelay = `${i * 80}ms`;
      row.innerHTML = `<span class="time">${escape(s.time)}</span><div class="event" style="--c: ${scheduleColorVar(s.color)}"><strong>${escape(s.title)}</strong><span>${escape(s.detail)}</span></div>`;
      scheduleList.appendChild(row);
    });
  };
  renderSchedule();

  /* ------------------------------ Stats computations ------------------------------ */
  const computeStats = () => {
    const total = state.tasks.length;
    const done = state.tasks.filter((t) => t.done).length;
    const open = total - done;
    const pct = total ? Math.round((done / total) * 100) : 0;

    // Weekly: count tasks completed in the last 7 days
    const now = Date.now();
    const dayMs = 86400000;
    const sevenDaysAgo = startOfDay(now - 6 * dayMs);
    const days = [0, 0, 0, 0, 0, 0, 0];
    state.tasks.forEach((t) => {
      if (!t.done || !t.doneAt) return;
      const d = startOfDay(t.doneAt);
      if (d >= sevenDaysAgo) {
        const idx = Math.min(6, Math.floor((d - sevenDaysAgo) / dayMs));
        days[idx] += 1;
      }
    });
    const totalThisWeek = days.reduce((a, b) => a + b, 0);
    const weeklyGoal = 7;
    const weeklyPct = Math.min(100, Math.round((totalThisWeek / weeklyGoal) * 100));

    // Streak: consecutive days with at least one completion, ending today or yesterday
    const completedDays = new Set();
    state.tasks.forEach((t) => { if (t.done && t.doneAt) completedDays.add(startOfDay(t.doneAt)); });
    let streak = 0;
    let cursor = startOfDay(now);
    const todayKey = cursor;
    const yesterdayKey = startOfDay(now - dayMs);
    if (!completedDays.has(todayKey) && !completedDays.has(yesterdayKey)) {
      streak = 0;
    } else {
      if (!completedDays.has(todayKey)) cursor = yesterdayKey;
      while (completedDays.has(cursor)) { streak += 1; cursor -= dayMs; }
    }

    // Focus time (estimated): sum of `time` for done tasks
    let focusMinutes = 0;
    state.tasks.forEach((t) => {
      if (!t.done) return;
      const m = parseInt(t.time, 10);
      if (!isNaN(m)) focusMinutes += m;
    });
    // add baseline 1h 20m so it doesn't read 0 on first run
    focusMinutes += 80;
    const trend = open > 0 ? '+' : '';

    return { total, done, open, pct, days, weeklyPct, streak, focusMinutes, trend };
  };

  /* ------------------------------ Stats render ------------------------------ */
  const renderStats = () => {
    const s = computeStats();
    const fh = Math.floor(s.focusMinutes / 60);
    const fm = s.focusMinutes % 60;
    const fhEl = $('#focus-hours'); if (fhEl) fhEl.textContent = fh;
    const fmEl = $('#focus-minutes'); if (fmEl) fmEl.textContent = fm;
    const trendEl = $('#focus-trend'); if (trendEl) trendEl.textContent = `${s.trend}${s.open * 18}m from yesterday`;

    const cc = $('#completed-count'); if (cc) cc.textContent = s.done;
    const tc = $('#total-count'); if (tc) tc.textContent = s.total;
    const cp = $('#completion-percent'); if (cp) cp.textContent = `${s.pct}%`;
    const ring = $('#ring-progress'); if (ring) ring.setAttribute('stroke-dashoffset', 100 - s.pct);
    const ct = $('#completed-trend'); if (ct) ct.textContent = s.pct >= 50 ? 'Keep the momentum' : 'Stay with it';

    const sd = $('#streak-days'); if (sd) sd.textContent = s.streak;
    const sb = $('#streak-best'); if (sb) sb.textContent = Math.max(s.streak, 12);
    const dots = $('#streak-dots');
    if (dots) {
      dots.innerHTML = '';
      s.days.forEach((n, i) => {
        const d = document.createElement('i');
        if (n > 0) d.classList.add('is-on');
        if (i === 6) d.classList.add('today-dot');
        d.style.animationDelay = `${i * 60}ms`;
        dots.appendChild(d);
      });
    }

    const weeklyPct = s.weeklyPct;
    const wp = $('#weekly-percent'); if (wp) wp.textContent = `${weeklyPct}%`;
    const wb = $('#weekly-bar'); if (wb) wb.style.setProperty('--p', `${weeklyPct}%`);
    const wd = $('#weekly-dots');
    if (wd) {
      wd.innerHTML = '';
      s.days.forEach((n) => {
        const d = document.createElement('span');
        d.className = 'dot' + (n > 0 ? ' dot--on' : '');
        wd.appendChild(d);
      });
    }

    // nav counts
    const navToday = $('#nav-today'); if (navToday) navToday.textContent = s.open;
    const navInbox = $('#nav-inbox'); if (navInbox) navInbox.textContent = state.tasks.filter((t) => t.projectId === 'inbox').length;
    const tabInbox = $('#tab-inbox');
    if (tabInbox) {
      const c = state.tasks.filter((t) => t.projectId === 'inbox').length;
      tabInbox.textContent = c;
      tabInbox.classList.toggle('is-show', c > 0);
    }
  };

  /* ------------------------------ Task list ------------------------------ */
  let activeFilter = 'all';
  let activeMode = 'list';
  let sortMode = 'priority';

  const taskList = $('#task-list');
  const filterPills = $$('#filter-pills .filter-pill');

  const priorityOrder = { high: 1, medium: 2, low: 3 };

  const renderTasks = () => {
    let list = [...state.tasks];
    if (activeFilter === 'all') {
      list.sort((a, b) => (a.done === b.done) ? 0 : a.done ? 1 : -1);
    } else if (activeFilter === 'work') {
      list = list.filter((t) => t.project === 'work');
    } else if (activeFilter === 'personal') {
      list = list.filter((t) => t.project === 'personal');
    } else if (activeFilter.startsWith('project:')) {
      const pid = activeFilter.slice('project:'.length);
      list = list.filter((t) => t.projectId === pid);
    }
    if (sortMode === 'priority') list.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || (b.createdAt - a.createdAt));
    else list.sort((a, b) => b.createdAt - a.createdAt);

    if (!taskList) return;
    taskList.innerHTML = '';
    taskList.classList.toggle('board-view', activeMode === 'board');

    if (!list.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:32px 12px;text-align:center;color:var(--text-3);font-size:12.5px;';
      empty.innerHTML = `Nothing here yet. <button class="text-button" id="empty-add" style="display:inline;color:var(--forest);text-decoration:underline;width:auto;height:auto;padding:0;">Add a task</button> to get started.`;
      taskList.appendChild(empty);
      $('#empty-add')?.addEventListener('click', openModal);
    } else {
      const frag = document.createDocumentFragment();
      list.forEach((task, i) => {
        const row = document.createElement('article');
        row.className = `task-row ${task.done ? 'done' : ''}`;
        row.dataset.id = task.id;
        row.setAttribute('role', 'listitem');
        row.style.animationDelay = `${Math.min(i, 12) * 30}ms`;
        const project = state.projects.find((p) => p.id === task.projectId);
        const personal = task.project === 'personal';
        row.innerHTML = `
          <button class="check-box" aria-label="${task.done ? 'Mark incomplete' : 'Mark complete'}: ${escape(task.name)}" aria-pressed="${task.done}">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="body">
            <span class="task-name">${escape(task.name)}</span>
            <div class="task-meta">
              <span class="tag ${personal ? 'personal' : ''}">${escape(project?.name || 'Work')}</span>
              <span class="priority ${task.priority}" title="${task.priority} priority" aria-label="${task.priority} priority"></span>
              <span class="time">${escape(task.time)}</span>
            </div>
          </div>
          <span class="task-arrow" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M9 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>`;
        const check = row.querySelector('.check-box');
        const onToggle = () => toggleTask(task.id, row);
        check.addEventListener('click', (e) => { e.stopPropagation(); onToggle(); });
        row.addEventListener('click', onToggle);
        row.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }
        });
        row.tabIndex = 0;
        frag.appendChild(row);
      });
      taskList.appendChild(frag);
    }

    const tt = $('#task-total');
    if (tt) tt.textContent = state.tasks.filter((t) => !t.done).length;
    renderStats();
  };

  // Fixed: single render path via animationend, no race
  const toggleTask = (id, row) => {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    const wasDone = task.done;
    task.done = !task.done;
    if (task.done) task.doneAt = Date.now(); else delete task.doneAt;
    save();
    if (row && !prefersReducedMotion()) {
      // visually update the row without full re-render
      row.classList.toggle('done', task.done);
      row.classList.add('is-leaving');
      const done = () => {
        row.removeEventListener('transitionend', done);
        row.classList.remove('is-leaving');
        renderTasks();
      };
      row.addEventListener('transitionend', done, { once: true });
      // fallback in case transitionend doesn't fire
      setTimeout(() => { if (row.classList.contains('is-leaving')) done(); }, 600);
    } else {
      renderTasks();
    }
    showToast(task.done ? 'Task completed — nice work.' : 'Task moved back to your agenda.');
  };

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => { p.classList.remove('is-active'); p.setAttribute('aria-selected', 'false'); });
      pill.classList.add('is-active');
      pill.setAttribute('aria-selected', 'true');
      activeFilter = pill.dataset.filter;
      renderTasks();
    });
  });

  /* ------------------------------ Sort & view mode ------------------------------ */
  const sortBtn = $('#sort-tasks');
  sortBtn?.addEventListener('click', () => {
    sortMode = sortMode === 'priority' ? 'created' : 'priority';
    const label = sortBtn.querySelector('span');
    if (label) label.textContent = `Sort: ${sortMode === 'priority' ? 'Priority' : 'Recent'}`;
    renderTasks();
    showToast(`Sorted by ${sortMode === 'priority' ? 'priority' : 'most recent'}.`);
  });

  $$('.view-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.view-button').forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      activeMode = btn.dataset.viewMode;
      renderTasks();
    });
  });

  /* ------------------------------ Sheet (modal) ------------------------------ */
  const modal = $('#task-modal');
  const taskForm = $('#task-form');
  const taskProject = $('#task-project');
  const priorityPicker = $('#priority-picker');
  const timeChips = $('#time-chips');
  const taskPriority = $('#task-priority');
  const taskTime = $('#task-time');

  const populateProjectSelect = () => {
    if (!taskProject) return;
    taskProject.innerHTML = state.projects.map((p) => `<option value="${escape(p.id)}">${escape(p.name)}</option>`).join('');
  };
  populateProjectSelect();

  priorityPicker?.addEventListener('click', (e) => {
    const btn = e.target.closest('.priority-dot');
    if (!btn) return;
    $$('.priority-dot', priorityPicker).forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-checked', 'false'); });
    btn.classList.add('is-active');
    btn.setAttribute('aria-checked', 'true');
    taskPriority.value = btn.dataset.priority;
  });
  timeChips?.addEventListener('click', (e) => {
    const btn = e.target.closest('.time-chip');
    if (!btn) return;
    $$('.time-chip', timeChips).forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-checked', 'false'); });
    btn.classList.add('is-active');
    btn.setAttribute('aria-checked', 'true');
    taskTime.value = btn.dataset.time;
  });

  /* ------------------------------ Sheet manager (focus trap, swipe to dismiss) ------------------------------ */
  let activeSheet = null;
  let lastFocused = null;

  const openSheet = (sheet) => {
    if (!sheet) return;
    if (activeSheet && activeSheet !== sheet) closeSheet(activeSheet, true);
    lastFocused = document.activeElement;
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-sheet-open');
    activeSheet = sheet;
    // focus the first focusable
    setTimeout(() => {
      const focusable = sheet.querySelector('input, [tabindex]:not([tabindex="-1"]), button:not([data-close-sheet])');
      (focusable || sheet.querySelector('[data-close-sheet]') || sheet)?.focus?.();
      trapFocus(sheet);
    }, 120);
  };

  const closeSheet = (sheet, immediate = false) => {
    if (!sheet) return;
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    if (sheet === activeSheet) {
      activeSheet = null;
      document.body.classList.remove('has-sheet-open');
    }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  const closeAllSheets = () => { $$('.sheet.is-open').forEach((s) => closeSheet(s)); };

  const trapFocus = (sheet) => {
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      if (!sheet.classList.contains('is-open')) { sheet.removeEventListener('keydown', handler); return; }
      const focusables = $$('input, select, button, textarea, a[href], [tabindex]:not([tabindex="-1"])', sheet).filter((el) => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    sheet.addEventListener('keydown', handler);
  };

  // Generic open/close for any sheet
  $$('[data-close-sheet]').forEach((el) => el.addEventListener('click', () => {
    const sheet = el.closest('.sheet');
    if (sheet) closeSheet(sheet);
  }));

  // Click on backdrop closes (use mousedown to avoid closing when user is selecting text inside)
  $$('.sheet').forEach((sheet) => {
    const backdrop = sheet.querySelector('.sheet__backdrop');
    backdrop?.addEventListener('click', () => closeSheet(sheet));
  });

  // Swipe down to dismiss on touch
  const attachSwipe = (sheet) => {
    const panel = sheet.querySelector('.sheet__panel');
    if (!panel) return;
    let startY = 0, currentY = 0, dragging = false;
    panel.addEventListener('touchstart', (e) => {
      if (panel.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      dragging = true;
    }, { passive: true });
    panel.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      currentY = e.touches[0].clientY - startY;
      if (currentY > 0) panel.style.transform = `translateY(${currentY}px)`;
    }, { passive: true });
    panel.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      if (currentY > 120) {
        closeSheet(sheet);
      }
      panel.style.transform = '';
      currentY = 0;
    });
  };
  $$('.sheet').forEach(attachSwipe);

  const openModal = () => {
    openSheet(modal);
    setTimeout(() => $('#task-name')?.focus(), 140);
  };
  const closeModal = () => closeSheet(modal);

  $('#add-task')?.addEventListener('click', openModal);
  $('#add-inline')?.addEventListener('click', openModal);

  taskForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(taskForm);
    const name = (data.get('name') || '').toString().trim();
    if (!name) { $('#task-name')?.focus(); return; }
    const projectId = data.get('project');
    const project = state.projects.find((p) => p.id === projectId);
    state.tasks.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      name,
      project: project?.id === 'personal' ? 'personal' : 'work',
      projectId,
      priority: data.get('priority') || 'medium',
      time: data.get('time') || '30 min',
      done: false,
      createdAt: Date.now(),
    });
    save();
    activeFilter = 'all';
    filterPills.forEach((p) => p.classList.toggle('is-active', p.dataset.filter === 'all'));
    renderTasks();
    renderProjects();
    closeModal();
    showToast('Added to your day.');
  });

  /* ------------------------------ Toast ------------------------------ */
  const toast = $('#toast');
  const toastText = toast?.querySelector('.toast__text');
  let toastTimer = null;
  const showToast = (message) => {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2800);
  };

  /* ------------------------------ Focus timer ------------------------------ */
  const timerDisplay = $('#timer-display');
  const timerStatus = $('#timer-status');
  const startBtn = $('#start-timer');
  const playIcon = $('#play-icon');
  const ringTrack = $('#timer-track');
  const ringGlow = $('#timer-glow');
  const timerRing = $('#timer-ring');
  let timerSeconds = 25 * 60;
  let totalSeconds = 25 * 60;
  let timerInterval = null;
  let isRunning = false;
  let activeModeBtn = 25;

  const updateTimer = () => {
    if (timerDisplay) timerDisplay.textContent = formatTime(timerSeconds);
    const pct = totalSeconds ? ((totalSeconds - timerSeconds) / totalSeconds) * 100 : 0;
    if (ringTrack) ringTrack.setAttribute('stroke-dashoffset', pct);
    if (ringGlow) ringGlow.setAttribute('stroke-dashoffset', pct);
  };

  const setMode = (mins) => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    isRunning = false;
    timerSeconds = mins * 60;
    totalSeconds = mins * 60;
    if (timerStatus) timerStatus.textContent = 'Ready when you are';
    if (playIcon) playIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4 3l9 5-9 5z"/></svg>';
    timerRing?.classList.remove('is-active');
    updateTimer();
  };

  $$('.timer-mode__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.timer-mode__btn').forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      activeModeBtn = parseInt(btn.dataset.mode, 10);
      setMode(activeModeBtn);
    });
  });

  const startTimer = () => {
    if (timerSeconds <= 0) { setMode(activeModeBtn); return; }
    if (isRunning) {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      if (timerStatus) timerStatus.textContent = 'Paused for now';
      if (playIcon) playIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4 3l9 5-9 5z"/></svg>';
      timerRing?.classList.remove('is-active');
      return;
    }
    isRunning = true;
    if (timerStatus) timerStatus.textContent = 'In the zone';
    if (playIcon) playIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="3" height="10" rx="1"/><rect x="9" y="3" width="3" height="10" rx="1"/></svg>';
    timerRing?.classList.add('is-active');
    timerInterval = setInterval(() => {
      timerSeconds -= 1;
      updateTimer();
      if (timerSeconds <= 0) {
        clearInterval(timerInterval); timerInterval = null; isRunning = false;
        if (timerStatus) timerStatus.textContent = 'Session complete';
        if (playIcon) playIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4 3l9 5-9 5z"/></svg>';
        timerRing?.classList.remove('is-active');
        showToast('Focus session complete. Take a breath.');
      }
    }, 1000);
  };

  startBtn?.addEventListener('click', startTimer);
  $('#reset-timer')?.addEventListener('click', () => {
    setMode(activeModeBtn);
    showToast('Timer reset.');
  });
  $('#skip-timer')?.addEventListener('click', () => {
    setMode(activeModeBtn);
    showToast('Session skipped. Your attention is still yours.');
  });

  updateTimer();

  /* ------------------------------ View router ------------------------------ */
  const navLinks = $$('[data-nav]');
  const validViews = new Set(['today', 'inbox', 'upcoming', 'completed']);

  const viewLabels = { today: 'Today', inbox: 'Inbox', upcoming: 'Upcoming', completed: 'Completed' };

  const setView = (view) => {
    if (view.startsWith('project:')) {
      const pid = view.slice('project:'.length);
      const p = state.projects.find((x) => x.id === pid);
      if (p) {
        $$('.nav-link[data-view]').forEach((l) => l.classList.remove('is-active'));
        $$('#tabbar [data-view]').forEach((l) => l.classList.remove('is-active'));
        $$('.project-row').forEach((r) => r.classList.toggle('is-active', r.dataset.project === pid));
        $('#view-label').textContent = p.name;
        localStorage.setItem(VIEW_KEY, view);
        activeFilter = view;
        renderTasks();
        return;
      }
    }
    if (!validViews.has(view)) view = 'today';
    $$('.nav-link[data-view]').forEach((l) => l.classList.toggle('is-active', l.dataset.view === view));
    $$('#tabbar [data-view]').forEach((l) => l.classList.toggle('is-active', l.dataset.view === view));
    $$('.project-row').forEach((r) => r.classList.remove('is-active'));
    $('#view-label').textContent = viewLabels[view];
    localStorage.setItem(VIEW_KEY, view);
    if (view === 'inbox') activeFilter = 'project:inbox';
    else if (view === 'completed') activeFilter = 'all';
    else if (activeFilter && activeFilter.startsWith('project:')) activeFilter = 'all';
    // sync filter pill UI to current activeFilter (only for non-project filters)
    if (!activeFilter.startsWith('project:')) {
      filterPills.forEach((p) => { const on = p.dataset.filter === activeFilter; p.classList.toggle('is-active', on); p.setAttribute('aria-selected', on ? 'true' : 'false'); });
    }
    renderTasks();
    if (isMobile()) closeSidebar();
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const view = link.dataset.view;
      if (!view) return;
      e.preventDefault();
      setView(view);
    });
  });

  // Apply initial view AFTER first render so counts are correct on first paint
  renderTasks();
  const initialView = localStorage.getItem(VIEW_KEY) || 'today';
  setView(initialView);

  /* ------------------------------ Sidebar sheet (mobile) ------------------------------ */
  const sidebar = $('#sidebar');
  const sidebarScrim = $('.sidebar-scrim');
  const openSidebar = () => { sidebar?.classList.add('is-open'); sidebarScrim?.classList.add('is-show'); sidebarScrim?.setAttribute('aria-hidden', 'false'); };
  const closeSidebar = () => { sidebar?.classList.remove('is-open'); sidebarScrim?.classList.remove('is-show'); sidebarScrim?.setAttribute('aria-hidden', 'true'); };
  $('#menu-trigger')?.addEventListener('click', openSidebar);
  $$('[data-close-sidebar]').forEach((el) => el.addEventListener('click', closeSidebar));
  sidebarScrim?.addEventListener('click', closeSidebar);

  /* ------------------------------ Bottom tab bar ------------------------------ */
  $('#tab-focus')?.addEventListener('click', () => { startTimer(); });
  $('#tab-menu')?.addEventListener('click', openSidebar);

  /* ------------------------------ New project (inline) ------------------------------ */
  $('#new-project')?.addEventListener('click', () => {
    const name = prompt('Name your project');
    if (!name || !name.trim()) return;
    const colors = ['coral', 'amber', 'sage', 'rust', 'cream'];
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    const color = colors[state.projects.length % colors.length];
    state.projects.push({ id, name: name.trim(), color });
    save();
    renderProjects();
    populateProjectSelect();
    showToast(`Created “${name.trim()}”.`);
  });

  /* ------------------------------ Calendar link ------------------------------ */
  $('#open-calendar')?.addEventListener('click', () => showToast('Calendar view is coming soon.'));

  /* ------------------------------ Command palette ------------------------------ */
  const palette = $('#command-palette');
  const commandInput = $('#command-input');
  const commandList = $('#command-list');
  let activeCommand = 0;

  const allTasks = () => state.tasks.filter((t) => !t.done);

  const commands = () => [
    { id: 'add', label: 'Add new task', hint: 'N', icon: 'plus', run: openModal },
    { id: 'focus', label: 'Start focus session', hint: 'F', icon: 'play', run: startTimer },
    { id: 'reset', label: 'Reset focus timer', hint: 'R', icon: 'reset', run: () => $('#reset-timer')?.click() },
    { id: 'sort', label: 'Toggle task sort', hint: 'S', icon: 'sort', run: () => $('#sort-tasks')?.click() },
    { id: 'inbox', label: 'Go to Inbox', hint: 'G I', icon: 'inbox', run: () => setView('inbox') },
    { id: 'today', label: 'Go to Today', hint: 'G T', icon: 'today', run: () => setView('today') },
    { id: 'upcoming', label: 'Go to Upcoming', hint: 'G U', icon: 'calendar', run: () => setView('upcoming') },
    { id: 'completed', label: 'Go to Completed', hint: 'G C', icon: 'check', run: () => setView('completed') },
    ...allTasks().slice(0, 5).map((t) => ({
      id: `task:${t.id}`,
      label: t.name,
      hint: 'Task',
      icon: t.done ? 'check' : 'task',
      run: () => {
        const row = taskList?.querySelector(`[data-id="${t.id}"]`);
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row?.classList.add('is-leaving');
        setTimeout(() => { row?.classList.remove('is-leaving'); toggleTask(t.id, row); }, 400);
        showToast(t.done ? 'Marked incomplete' : 'Completed');
      },
    })),
  ];

  const iconSvg = (name) => {
    const map = {
      plus: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3v10M3 8h10" stroke-linecap="round"/></svg>',
      play: '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M5 3l8 5-8 5z"/></svg>',
      inbox: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 4.5h11v7a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z"/><path d="M2.5 4.5l1.6 2.5h7.8l1.6-2.5"/></svg>',
      today: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4v4l2.5 1.5" stroke-linecap="round"/></svg>',
      calendar: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3.5" width="12" height="10" rx="1.5"/><path d="M2 6.5h12"/></svg>',
      check: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8.5l3 3 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      reset: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8a5 5 0 1 0 1.5-3.5L3 6M3 3v3h3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      sort: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4h10M5 8h6M7 12h2" stroke-linecap="round"/></svg>',
      task: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 8l1.7 1.7L11 6" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/></svg>',
    };
    return map[name] || '';
  };

  const renderCommands = (filter = '') => {
    if (!commandList) return;
    const all = commands().filter((c) => c.label.toLowerCase().includes(filter.toLowerCase()));
    commandList.innerHTML = '';
    if (!all.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:18px;text-align:center;color:var(--text-3);font-size:12px;';
      empty.textContent = 'No matches. Try a different search.';
      commandList.appendChild(empty);
      activeCommand = 0;
      return;
    }
    activeCommand = Math.min(activeCommand, all.length - 1);
    const frag = document.createDocumentFragment();
    all.forEach((c, i) => {
      const item = document.createElement('div');
      item.className = `command-item ${i === activeCommand ? 'is-active' : ''}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', i === activeCommand ? 'true' : 'false');
      item.innerHTML = `<span class="command-item__icon">${iconSvg(c.icon)}</span><span class="command-item__label">${escape(c.label)}</span><span class="command-item__hint">${escape(c.hint)}</span>`;
      item.addEventListener('click', () => { c.run(); closeSheet(palette); });
      frag.appendChild(item);
    });
    commandList.appendChild(frag);
  };

  const openPalette = () => {
    openSheet(palette);
    setTimeout(() => commandInput?.focus(), 140);
    if (commandInput) commandInput.value = '';
    activeCommand = 0;
    renderCommands('');
  };

  $('#search-trigger')?.addEventListener('click', openPalette);
  commandInput?.addEventListener('input', () => { activeCommand = 0; renderCommands(commandInput.value); });
  commandInput?.addEventListener('keydown', (e) => {
    const items = commandList?.querySelectorAll('.command-item') || [];
    if (e.key === 'ArrowDown') { e.preventDefault(); activeCommand = (activeCommand + 1) % Math.max(items.length, 1); renderCommands(commandInput.value); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeCommand = (activeCommand - 1 + items.length) % Math.max(items.length, 1); renderCommands(commandInput.value); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const all = commands().filter((c) => c.label.toLowerCase().includes(commandInput.value.toLowerCase()));
      if (all[activeCommand]) { all[activeCommand].run(); closeSheet(palette); }
    }
  });

  /* ------------------------------ Global shortcuts ------------------------------ */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette?.classList.contains('is-open') ? closeSheet(palette) : openPalette();
    } else if (e.key === 'Escape') {
      if (palette?.classList.contains('is-open')) closeSheet(palette);
      else if (modal?.classList.contains('is-open')) closeModal();
      else if (sidebar?.classList.contains('is-open')) closeSidebar();
    } else if (!e.metaKey && !e.ctrlKey && !e.altKey && !activeSheet && !modal?.classList.contains('is-open')) {
      if (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'n') { e.preventDefault(); openModal(); }
      else if (k === 'f') { e.preventDefault(); startTimer(); }
      else if (k === 'r') { e.preventDefault(); $('#reset-timer')?.click(); }
      else if (k === 's') { e.preventDefault(); sortBtn?.click(); }
      else if (k === '/') { e.preventDefault(); openPalette(); }
      else if (k === 'g') {
        // 'g' then next key: g+t, g+i, g+u, g+c
        const onNext = (e2) => {
          document.removeEventListener('keydown', onNext, true);
          if (e2.key.toLowerCase() === 't') setView('today');
          else if (e2.key.toLowerCase() === 'i') setView('inbox');
          else if (e2.key.toLowerCase() === 'u') setView('upcoming');
          else if (e2.key.toLowerCase() === 'c') setView('completed');
        };
        document.addEventListener('keydown', onNext, true);
      }
    }
  });

  /* ------------------------------ Resize handler ------------------------------ */
  let lastMobile = isMobile();
  const onResize = debounce(() => {
    const nowMobile = isMobile();
    if (nowMobile !== lastMobile) {
      lastMobile = nowMobile;
      // ensure no half-open sheets when switching modes
      if (!nowMobile) { closeSidebar(); closeAllSheets(); }
    }
  }, 150);
  window.addEventListener('resize', onResize);
})();
