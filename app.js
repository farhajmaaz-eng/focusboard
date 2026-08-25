/* ==========================================================================
   Focusboard v2 — interactions, motion, and state
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------ Storage ------------------------------ */
  const STORAGE_KEY = 'focusboard.v2';
  const VIEW_KEY = 'focusboard.view';

  const seed = () => ({
    tasks: [
      { id: 1, name: 'Review Q4 product roadmap', project: 'work', projectId: 'atlas', priority: 'high', time: '45 min', done: false, createdAt: Date.now() - 1000 * 60 * 60 * 4 },
      { id: 2, name: 'Send follow-up to engineering', project: 'work', projectId: 'atlas', priority: 'medium', time: '20 min', done: false, createdAt: Date.now() - 1000 * 60 * 60 * 3 },
      { id: 3, name: 'Sketch ideas for onboarding flow', project: 'work', projectId: 'studio', priority: 'high', time: '1 hr', done: false, createdAt: Date.now() - 1000 * 60 * 60 * 2 },
      { id: 4, name: 'Book a weekend pottery class', project: 'personal', projectId: 'personal', priority: 'low', time: '15 min', done: true, createdAt: Date.now() - 1000 * 60 * 60 * 26 },
      { id: 5, name: 'Read 20 pages of The Creative Act', project: 'personal', projectId: 'personal', priority: 'low', time: '30 min', done: false, createdAt: Date.now() - 1000 * 60 * 60 * 1 },
    ],
    projects: [
      { id: 'atlas', name: 'Atlas launch', color: 'coral', count: 12 },
      { id: 'studio', name: 'Studio refresh', color: 'violet', count: 5 },
      { id: 'personal', name: 'Personal', color: 'green', count: 3 },
    ],
    schedule: [
      { id: 's1', time: '10:30', title: 'Weekly sync', detail: 'Design team · 30 min', color: 'coral' },
      { id: 's2', time: '12:00', title: 'Lunch with Aisha', detail: 'Common Ground · 1 hr', color: 'amber' },
      { id: 's3', time: '15:30', title: 'Project review', detail: 'Atlas launch · 45 min', color: 'violet' },
    ],
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seed();
      const parsed = JSON.parse(raw);
      return { ...seed(), ...parsed };
    } catch {
      return seed();
    }
  };
  const save = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  const state = load();

  /* ------------------------------ Helpers ------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escape = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------ Date / Greeting ------------------------------ */
  const dateLine = $('#date-line');
  const greeting = $('#greeting');
  const lede = $('#lede');
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  dateLine.innerHTML = `${dateString} <span class="sun">☼</span>`;

  const hour = today.getHours();
  const greet = hour < 5 ? 'Working late' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  greeting.innerHTML = `${greet}, Farhaj<span class="wave">✦</span>`;

  const ledes = [
    'A clear mind makes room for meaningful work.',
    'Tiny steps, taken often, become the work itself.',
    'Choose depth over motion. The rest will follow.',
    'Today has space for one beautiful thing.',
  ];
  lede.textContent = ledes[today.getDate() % ledes.length];

  $('#schedule-date-strong').textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  /* ------------------------------ Reveal on load ------------------------------ */
  const reveals = $$('[data-reveal]');
  reveals.forEach((el, i) => {
    const delay = parseInt(el.dataset.reveal, 10) * 70 + 60;
    setTimeout(() => el.classList.add('is-in'), delay);
  });

  /* ------------------------------ Custom cursor ------------------------------ */
  const cursor = $('#cursor');
  const supportsCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsCursor) {
    document.body.classList.add('has-cursor');
    let cx = 0, cy = 0, rx = 0, ry = 0;
    const tick = () => {
      rx += (cx - rx) * 0.18;
      ry += (cy - ry) * 0.18;
      cursor.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', (e) => { cx = e.clientX; cy = e.clientY; });
    $$('a, button, [data-magnetic], .task-row, .filter-pill, .view-button, .timer-button, .time-chip, .priority-dot, .command-item, .project-row').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
      el.addEventListener('mousedown', () => cursor.classList.add('is-down'));
      el.addEventListener('mouseup', () => cursor.classList.remove('is-down'));
    });
    requestAnimationFrame(tick);
  }

  /* ------------------------------ Magnetic buttons ------------------------------ */
  $$('[data-magnetic]').forEach((el) => {
    const strength = 0.25;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* ------------------------------ Pointer glow on cards ------------------------------ */
  $$('.stat-card, .panel').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ------------------------------ Project nav render ------------------------------ */
  const projectsNav = $('#projects-nav');
  const renderProjects = () => {
    const heading = projectsNav.querySelector('.nav-heading');
    projectsNav.innerHTML = '';
    projectsNav.appendChild(heading);
    state.projects.forEach((p) => {
      const count = state.tasks.filter((t) => t.projectId === p.id).length;
      const a = document.createElement('a');
      a.className = 'project-row';
      a.href = `#project/${p.id}`;
      a.dataset.project = p.id;
      a.innerHTML = `<span class="project-dot ${p.color}"></span><span>${escape(p.name)}</span><span class="project-count">${count}</span>`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        $$('.project-row').forEach((r) => r.classList.remove('is-active'));
        a.classList.add('is-active');
        $('#view-label').textContent = p.name;
      });
      projectsNav.appendChild(a);
    });
  };
  renderProjects();

  /* ------------------------------ Schedule render ------------------------------ */
  const scheduleList = $('#schedule-list');
  const renderSchedule = () => {
    scheduleList.innerHTML = '';
    state.schedule.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'schedule-item';
      row.style.animationDelay = `${i * 80}ms`;
      row.innerHTML = `<span class="time">${escape(s.time)}</span><div class="event" style="--c: var(--accent${s.color === 'coral' ? '-3' : s.color === 'amber' ? '-5' : '-2'})"><strong>${escape(s.title)}</strong><span>${escape(s.detail)}</span></div>`;
      scheduleList.appendChild(row);
    });
  };
  renderSchedule();

  /* ------------------------------ Task list ------------------------------ */
  let activeFilter = 'all';
  let activeMode = 'list';
  let sortMode = 'priority';

  const taskList = $('#task-list');
  const filterPills = $$('#filter-pills .filter-pill');

  const priorityOrder = { high: 1, medium: 2, low: 3 };

  const renderTasks = (opts = {}) => {
    const { skipLeaveAnim = false } = opts;
    let list = [...state.tasks];
    if (activeFilter === 'all') {
      // show all uncompleted first, completed at bottom
      list.sort((a, b) => (a.done === b.done) ? 0 : a.done ? 1 : -1);
    } else if (activeFilter === 'work') {
      list = list.filter((t) => t.project === 'work');
    } else if (activeFilter === 'personal') {
      list = list.filter((t) => t.project === 'personal');
    }
    if (sortMode === 'priority') list.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || (b.createdAt - a.createdAt));

    taskList.innerHTML = '';
    taskList.classList.toggle('board-view', activeMode === 'board');

    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `<p>Nothing here yet. <button class="text-link" id="empty-add">Add a task</button> to get started.</p>`;
      empty.style.cssText = 'padding:32px 12px;text-align:center;color:var(--text-3);font-size:12.5px;';
      taskList.appendChild(empty);
      $('#empty-add')?.addEventListener('click', openModal);
    } else {
      list.forEach((task, i) => {
        const row = document.createElement('article');
        row.className = `task-row ${task.done ? 'done' : ''}`;
        row.dataset.id = task.id;
        row.style.animationDelay = `${i * 35}ms`;
        const project = state.projects.find((p) => p.id === task.projectId);
        row.innerHTML = `
          <button class="check-box" aria-label="Toggle complete">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3.5 8.5l3 3 6-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="body">
            <span class="task-name">${escape(task.name)}</span>
            <div class="task-meta">
              <span class="tag ${task.project === 'personal' ? 'personal' : ''}">${escape(project?.name || task.projectName || 'Work')}</span>
              <span class="priority ${task.priority}" title="${task.priority} priority"></span>
              <span class="time">${escape(task.time)}</span>
            </div>
          </div>
          <span class="task-arrow">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M9 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>`;
        row.querySelector('.check-box').addEventListener('click', (e) => {
          e.stopPropagation();
          toggleTask(task.id, row);
        });
        row.addEventListener('click', () => toggleTask(task.id, row));
        taskList.appendChild(row);
      });
    }

    const total = state.tasks.length;
    const done = state.tasks.filter((t) => t.done).length;
    $('#task-total').textContent = state.tasks.filter((t) => !t.done).length;
    $('#completed-count').textContent = done;
    $('#total-count').textContent = total;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $('#completion-percent').textContent = `${pct}%`;
    $('#ring-progress').setAttribute('stroke-dashoffset', 100 - pct);
    $('#nav-today').textContent = state.tasks.filter((t) => !t.done).length;
    $('#nav-inbox').textContent = state.tasks.filter((t) => t.projectId === 'inbox').length || Math.max(1, Math.floor(state.tasks.length / 3));
    const weeklyPct = total ? Math.min(100, Math.round((done / Math.max(total, 8)) * 100)) : 0;
    $('#weekly-percent').textContent = `${weeklyPct}%`;
    $('#weekly-bar').style.setProperty('--p', `${weeklyPct}%`);

    // update filter counts
    const allCount = state.tasks.filter((t) => !t.done).length;
    const workCount = state.tasks.filter((t) => !t.done && t.project === 'work').length;
    const personalCount = state.tasks.filter((t) => !t.done && t.project === 'personal').length;
    filterPills.forEach((p) => {
      const f = p.dataset.filter;
      const span = p.querySelector('span');
      if (span) {
        if (f === 'all') span.textContent = allCount;
        if (f === 'work') span.textContent = workCount;
        if (f === 'personal') span.textContent = personalCount;
      }
    });
  };

  const toggleTask = (id, row) => {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    task.done = !task.done;
    save(state);
    if (row) {
      row.classList.add('is-leaving');
      row.addEventListener('animationend', () => renderTasks(), { once: true });
      setTimeout(() => renderTasks(), 400);
    } else {
      renderTasks();
    }
    showToast(task.done ? 'Task completed — nice work.' : 'Task moved back to your agenda.');
  };

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      activeFilter = pill.dataset.filter;
      renderTasks();
    });
  });

  /* ------------------------------ Sort & view mode ------------------------------ */
  $('#sort-tasks').addEventListener('click', () => {
    sortMode = sortMode === 'priority' ? 'created' : 'priority';
    $('#sort-tasks span').textContent = `Sort: ${sortMode === 'priority' ? 'Priority' : 'Recent'}`;
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

  /* ------------------------------ Modal: add task ------------------------------ */
  const modal = $('#task-modal');
  const taskForm = $('#task-form');
  const taskProject = $('#task-project');
  const priorityPicker = $('#priority-picker');
  const timeChips = $('#time-chips');
  const taskPriority = $('#task-priority');
  const taskTime = $('#task-time');

  const populateProjectSelect = () => {
    taskProject.innerHTML = state.projects.map((p) => `<option value="${p.id}">${escape(p.name)}</option>`).join('');
  };
  populateProjectSelect();

  priorityPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('.priority-dot');
    if (!btn) return;
    $$('.priority-dot', priorityPicker).forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    taskPriority.value = btn.dataset.priority;
  });
  timeChips.addEventListener('click', (e) => {
    const btn = e.target.closest('.time-chip');
    if (!btn) return;
    $$('.time-chip', timeChips).forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    taskTime.value = btn.dataset.time;
  });

  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('#task-name').focus(), 120);
  };
  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    taskForm.reset();
    $$('.priority-dot').forEach((b) => b.classList.toggle('is-active', b.dataset.priority === 'medium'));
    $$('.time-chip').forEach((b) => b.classList.toggle('is-active', b.dataset.time === '30 min'));
    taskPriority.value = 'medium';
    taskTime.value = '30 min';
  };

  $('#add-task').addEventListener('click', openModal);
  $('#add-inline').addEventListener('click', openModal);
  $('#close-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(taskForm);
    const name = (data.get('name') || '').toString().trim();
    if (!name) return;
    const projectId = data.get('project');
    const project = state.projects.find((p) => p.id === projectId);
    state.tasks.unshift({
      id: Date.now(),
      name,
      project: project?.id === 'personal' ? 'personal' : 'work',
      projectId,
      projectName: project?.name || 'Work',
      priority: data.get('priority'),
      time: data.get('time'),
      done: false,
      createdAt: Date.now(),
    });
    save(state);
    activeFilter = 'all';
    filterPills.forEach((p) => p.classList.toggle('is-active', p.dataset.filter === 'all'));
    renderTasks();
    renderProjects();
    closeModal();
    showToast('Added to your day.');
  });

  /* ------------------------------ Toast ------------------------------ */
  const toast = $('#toast');
  const toastText = $('.toast__text', toast);
  let toastTimer = null;
  const showToast = (message) => {
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

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const updateTimer = () => {
    timerDisplay.textContent = formatTime(timerSeconds);
    const pct = totalSeconds ? ((totalSeconds - timerSeconds) / totalSeconds) * 100 : 0;
    ringTrack.setAttribute('stroke-dashoffset', pct);
    ringGlow.setAttribute('stroke-dashoffset', pct);
  };

  const setMode = (mins) => {
    clearInterval(timerInterval); timerInterval = null; isRunning = false;
    timerSeconds = mins * 60; totalSeconds = mins * 60;
    timerStatus.textContent = 'Ready when you are';
    playIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M4 3l9 5-9 5z"/></svg>';
    timerRing.classList.remove('is-active');
    updateTimer();
  };

  $$('.timer-mode__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.timer-mode__btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      setMode(parseInt(btn.dataset.mode, 10));
    });
  });

  const startTimer = () => {
    if (timerSeconds <= 0) { setMode(25); return; }
    if (isRunning) {
      clearInterval(timerInterval); timerInterval = null; isRunning = false;
      timerStatus.textContent = 'Paused for now';
      playIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M4 3l9 5-9 5z"/></svg>';
      timerRing.classList.remove('is-active');
      return;
    }
    isRunning = true;
    timerStatus.textContent = 'In the zone';
    playIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><rect x="4" y="3" width="3" height="10" rx="1"/><rect x="9" y="3" width="3" height="10" rx="1"/></svg>';
    timerRing.classList.add('is-active');
    timerInterval = setInterval(() => {
      timerSeconds -= 1;
      updateTimer();
      if (timerSeconds <= 0) {
        clearInterval(timerInterval); timerInterval = null; isRunning = false;
        timerStatus.textContent = 'Session complete';
        playIcon.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M4 3l9 5-9 5z"/></svg>';
        timerRing.classList.remove('is-active');
        showToast('Focus session complete. Take a breath.');
      }
    }, 1000);
  };

  startBtn.addEventListener('click', startTimer);
  $('#reset-timer').addEventListener('click', () => {
    const activeMode = $('.timer-mode__btn.is-active');
    setMode(parseInt(activeMode?.dataset.mode || 25, 10));
    showToast('Timer reset.');
  });
  $('#skip-timer').addEventListener('click', () => {
    const activeMode = $('.timer-mode__btn.is-active');
    setMode(parseInt(activeMode?.dataset.mode || 25, 10));
    showToast('Session skipped. Your attention is still yours.');
  });

  updateTimer();

  /* ------------------------------ View router ------------------------------ */
  const navLinks = $$('[data-nav]');
  const setView = (view) => {
    navLinks.forEach((l) => {
      if (l.dataset.view) l.classList.toggle('is-active', l.dataset.view === view);
    });
    const label = view.charAt(0).toUpperCase() + view.slice(1);
    $('#view-label').textContent = label;
    localStorage.setItem(VIEW_KEY, view);
  };
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const view = link.dataset.view;
      if (!view) return;
      e.preventDefault();
      setView(view);
    });
  });
  const initialView = localStorage.getItem(VIEW_KEY) || 'today';
  setView(initialView);

  /* ------------------------------ New project ------------------------------ */
  $('#new-project').addEventListener('click', () => {
    const name = prompt('Name your project');
    if (!name) return;
    const colors = ['coral', 'violet', 'green', 'amber', 'cyan'];
    const color = colors[state.projects.length % colors.length];
    state.projects.push({ id: name.toLowerCase().replace(/\s+/g, '-'), name, color, count: 0 });
    save(state);
    renderProjects();
    populateProjectSelect();
    showToast(`Created “${name}”.`);
  });

  /* ------------------------------ Calendar link ------------------------------ */
  $('#open-calendar').addEventListener('click', () => showToast('Calendar view is coming soon.'));

  /* ------------------------------ Command palette ------------------------------ */
  const palette = $('#command-palette');
  const commandInput = $('#command-input');
  const commandList = $('#command-list');
  let activeCommand = 0;

  const commands = () => [
    { id: 'add', label: 'Add new task', hint: 'N', icon: 'plus', run: openModal },
    { id: 'focus', label: 'Start focus session', hint: 'F', icon: 'play', run: startTimer },
    { id: 'inbox', label: 'Go to Inbox', hint: 'G I', icon: 'inbox', run: () => setView('inbox') },
    { id: 'today', label: 'Go to Today', hint: 'G T', icon: 'today', run: () => setView('today') },
    { id: 'upcoming', label: 'Go to Upcoming', hint: 'G U', icon: 'calendar', run: () => setView('upcoming') },
    { id: 'completed', label: 'Go to Completed', hint: 'G C', icon: 'check', run: () => setView('completed') },
    { id: 'reset', label: 'Reset focus timer', hint: 'R', icon: 'reset', run: () => $('#reset-timer').click() },
    { id: 'sort', label: 'Toggle task sort', hint: 'S', icon: 'sort', run: () => $('#sort-tasks').click() },
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
    };
    return map[name] || '';
  };

  const renderCommands = (filter = '') => {
    const all = commands().filter((c) => c.label.toLowerCase().includes(filter.toLowerCase()));
    commandList.innerHTML = '';
    if (!all.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:18px;text-align:center;color:var(--text-3);font-size:12px;';
      empty.textContent = 'No commands match that search.';
      commandList.appendChild(empty);
      activeCommand = 0;
      return;
    }
    activeCommand = Math.min(activeCommand, all.length - 1);
    all.forEach((c, i) => {
      const item = document.createElement('div');
      item.className = `command-item ${i === activeCommand ? 'is-active' : ''}`;
      item.innerHTML = `<span class="command-item__icon">${iconSvg(c.icon)}</span><span class="command-item__label">${escape(c.label)}</span><span class="command-item__hint">${escape(c.hint)}</span>`;
      item.addEventListener('click', () => { c.run(); closePalette(); });
      item.addEventListener('mousemove', () => { activeCommand = i; renderCommands(commandInput.value); });
      commandList.appendChild(item);
    });
  };

  const openPalette = () => {
    palette.classList.add('is-open');
    palette.setAttribute('aria-hidden', 'false');
    setTimeout(() => commandInput.focus(), 80);
    commandInput.value = '';
    activeCommand = 0;
    renderCommands('');
  };
  const closePalette = () => {
    palette.classList.remove('is-open');
    palette.setAttribute('aria-hidden', 'true');
  };

  $('#search-trigger').addEventListener('click', openPalette);
  $$('[data-close]', palette).forEach((el) => el.addEventListener('click', closePalette));
  commandInput.addEventListener('input', () => { activeCommand = 0; renderCommands(commandInput.value); });
  commandInput.addEventListener('keydown', (e) => {
    const items = commandList.querySelectorAll('.command-item');
    if (e.key === 'ArrowDown') { e.preventDefault(); activeCommand = (activeCommand + 1) % Math.max(items.length, 1); renderCommands(commandInput.value); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeCommand = (activeCommand - 1 + items.length) % Math.max(items.length, 1); renderCommands(commandInput.value); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const all = commands().filter((c) => c.label.toLowerCase().includes(commandInput.value.toLowerCase()));
      if (all[activeCommand]) { all[activeCommand].run(); closePalette(); }
    } else if (e.key === 'Escape') { closePalette(); }
  });

  /* ------------------------------ Global shortcuts ------------------------------ */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.classList.contains('is-open') ? closePalette() : openPalette();
    } else if (e.key === 'Escape') {
      if (palette.classList.contains('is-open')) closePalette();
      else if (modal.classList.contains('is-open')) closeModal();
    } else if (!e.metaKey && !e.ctrlKey && !e.altKey && !palette.classList.contains('is-open') && !modal.classList.contains('is-open')) {
      if (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'n') { e.preventDefault(); openModal(); }
      else if (k === 'f') { e.preventDefault(); startTimer(); }
      else if (k === 'r') { e.preventDefault(); $('#reset-timer').click(); }
      else if (k === 's') { e.preventDefault(); $('#sort-tasks').click(); }
      else if (k === '/') { e.preventDefault(); openPalette(); }
    }
  });

  /* ------------------------------ Initial render ------------------------------ */
  renderTasks();

  /* ------------------------------ Subtle parallax on orbs ------------------------------ */
  const orbs = $$('.ambient__orb');
  if (orbs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      orbs.forEach((o, i) => {
        const k = (i + 1) * 0.5;
        o.style.translate = `${x * k}px ${y * k}px`;
      });
    }, { passive: true });
  }
})();
