const seedTasks = [
  { id: 1, name: 'Review Q4 product roadmap', project: 'work', projectName: 'Atlas launch', priority: 'high', time: '45 min', done: false },
  { id: 2, name: 'Send follow-up to engineering', project: 'work', projectName: 'Atlas launch', priority: 'medium', time: '20 min', done: false },
  { id: 3, name: 'Sketch ideas for onboarding flow', project: 'work', projectName: 'Studio refresh', priority: 'high', time: '1 hr', done: false },
  { id: 4, name: 'Book a weekend pottery class', project: 'personal', projectName: 'Personal', priority: 'low', time: '15 min', done: true },
  { id: 5, name: 'Read 20 pages of The Creative Act', project: 'personal', projectName: 'Personal', priority: 'low', time: '30 min', done: false },
];

const stored = localStorage.getItem('focusboard-tasks');
let tasks = stored ? JSON.parse(stored) : seedTasks;
let activeFilter = 'all';
let timerSeconds = 25 * 60;
let timerInterval = null;

const $ = (selector) => document.querySelector(selector);
const taskList = $('#task-list');

function saveTasks() { localStorage.setItem('focusboard-tasks', JSON.stringify(tasks)); }

function renderTasks() {
  taskList.innerHTML = '';
  const visibleTasks = tasks.filter((task) => activeFilter === 'all' || task.project === activeFilter);
  visibleTasks.forEach((task, index) => {
    const row = document.createElement('article');
    row.className = `task-row ${task.done ? 'done' : ''}`;
    row.dataset.id = task.id;
    row.style.animationDelay = `${index * 35}ms`;
    row.innerHTML = `<button class="check-box" aria-label="${task.done ? 'Mark incomplete' : 'Complete'} ${escapeHtml(task.name)}">✓</button><div><span class="task-name">${escapeHtml(task.name)}</span><div class="task-meta"><span class="tag ${task.project === 'personal' ? 'personal' : ''}">${escapeHtml(task.projectName)}</span><span class="priority ${task.priority}" title="${task.priority} priority"></span><span>${escapeHtml(task.time)}</span></div></div><span class="task-arrow">→</span>`;
    row.querySelector('.check-box').addEventListener('click', () => toggleTask(task.id));
    taskList.appendChild(row);
  });
  $('#task-total').textContent = visibleTasks.length;
  const completed = tasks.filter((task) => task.done).length;
  $('#completed-count').innerHTML = `${completed} <em>/ ${tasks.length}</em>`;
  $('#completion-percent').textContent = `${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%`;
  $('.nav-link[data-view="today"] b').textContent = tasks.filter((task) => !task.done).length;
}

function escapeHtml(value) { return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks(); renderTasks();
  showToast(task.done ? 'Task completed — nice work.' : 'Task moved back to your agenda.');
}

function openModal() { $('#task-modal').classList.add('open'); $('#task-modal').setAttribute('aria-hidden', 'false'); setTimeout(() => $('#task-name').focus(), 100); }
function closeModal() { $('#task-modal').classList.remove('open'); $('#task-modal').setAttribute('aria-hidden', 'true'); $('#task-form').reset(); }

function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timeout); showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2600); }

function updateTimer() { const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, '0'); const seconds = (timerSeconds % 60).toString().padStart(2, '0'); $('#timer-display').textContent = `${minutes}:${seconds}`; }
function startTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; $('#start-timer').textContent = '▶'; $('#timer-status').textContent = 'Paused for now'; return; }
  $('#start-timer').textContent = 'Ⅱ'; $('#timer-status').textContent = 'In the zone';
  timerInterval = setInterval(() => { timerSeconds -= 1; updateTimer(); if (timerSeconds <= 0) { clearInterval(timerInterval); timerInterval = null; $('#start-timer').textContent = '▶'; $('#timer-status').textContent = 'Session complete'; showToast('Focus session complete. Take a breath.'); } }, 1000);
}
function resetTimer() { clearInterval(timerInterval); timerInterval = null; timerSeconds = 25 * 60; updateTimer(); $('#start-timer').textContent = '▶'; $('#timer-status').textContent = 'Ready when you are'; }

document.querySelectorAll('.filter-pill').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.remove('active')); button.classList.add('active'); activeFilter = button.dataset.filter; renderTasks(); }));
document.querySelectorAll('.nav-link[data-view]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); document.querySelectorAll('.nav-link[data-view]').forEach((item) => item.classList.remove('active')); link.classList.add('active'); const view = link.dataset.view; $('#view-label').textContent = view[0].toUpperCase() + view.slice(1); if (view === 'completed') { activeFilter = 'all'; tasks.forEach((task) => { task._previousDone = task.done; }); tasks = tasks.filter((task) => task.done); } else { const storedTasks = localStorage.getItem('focusboard-tasks'); tasks = storedTasks ? JSON.parse(storedTasks) : seedTasks; } renderTasks(); }));
$('#add-task').addEventListener('click', openModal); $('#add-inline').addEventListener('click', openModal); $('#close-modal').addEventListener('click', closeModal); $('#task-modal').addEventListener('click', (event) => { if (event.target === $('#task-modal')) closeModal(); });
$('#task-form').addEventListener('submit', (event) => { event.preventDefault(); const data = new FormData(event.target); tasks.unshift({ id: Date.now(), name: data.get('name').trim(), project: data.get('project'), projectName: data.get('project') === 'work' ? 'Atlas launch' : 'Personal', priority: data.get('priority'), time: data.get('time'), done: false }); saveTasks(); activeFilter = 'all'; document.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.toggle('active', pill.dataset.filter === 'all')); renderTasks(); closeModal(); showToast('Added to your day.'); });
$('#start-timer').addEventListener('click', startTimer); $('#reset-timer').addEventListener('click', resetTimer); $('#skip-timer').addEventListener('click', () => { resetTimer(); showToast('Session skipped. Your attention is still yours.'); });
$('#search-trigger').addEventListener('click', () => { const query = window.prompt('Search your tasks'); if (!query) return; const found = tasks.filter((task) => task.name.toLowerCase().includes(query.toLowerCase())); showToast(found.length ? `${found.length} matching task${found.length === 1 ? '' : 's'} found.` : 'No matching tasks yet.'); });
$('#sort-tasks').addEventListener('click', () => { const order = { high: 1, medium: 2, low: 3 }; tasks.sort((a, b) => order[a.priority] - order[b.priority]); saveTasks(); renderTasks(); showToast('Sorted by priority.'); });
$('#open-calendar').addEventListener('click', () => showToast('Calendar view is coming soon.')); $('#new-project').addEventListener('click', () => showToast('Project creation is coming soon.')); document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#search-trigger').click(); } if (event.key === 'Escape') closeModal(); });

const today = new Date();
$('#date-line').innerHTML = `${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} <span class="sun">☼</span>`;
renderTasks(); updateTimer();
