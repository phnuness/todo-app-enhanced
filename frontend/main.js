const apiBase = '';

const form = document.getElementById('task-form');
const tasksEl = document.getElementById('tasks');
const filterPriority = document.getElementById('filter-priority');
const orderBy = document.getElementById('orderBy');

async function fetchTasks() {
  const params = new URLSearchParams();
  if (filterPriority.value) params.append('priority', filterPriority.value);
  if (orderBy.value) params.append('orderBy', orderBy.value);
  const res = await fetch('/tasks?' + params.toString());
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  tasksEl.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task ' + (t.completed ? 'done' : '');
    li.innerHTML = `
      <div class="left">
        <input type="checkbox" data-id="${t.id}" ${t.completed ? 'checked' : ''}/>
        <div class="meta">
          <strong>${escapeHtml(t.title)}</strong>
          <div class="sub">${t.priority ? 'Prioridade: ' + t.priority : ''} ${t.due_date ? ' • Vence: ' + t.due_date : ''}</div>
        </div>
      </div>
      <div class="actions">
        <button class="edit" data-id="${t.id}">Editar</button>
        <button class="delete" data-id="${t.id}">Excluir</button>
      </div>
    `;
    tasksEl.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const due_date = document.getElementById('due_date').value || null;
  const priority = document.getElementById('priority').value;
  if (!title) return;
  await fetch('/tasks', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ title, priority, due_date })
  });
  form.reset();
  fetchTasks();
});

tasksEl.addEventListener('click', async (e) => {
  if (e.target.matches('input[type="checkbox"]')) {
    const id = e.target.dataset.id;
    await fetch(`/tasks/${id}/complete`, { method: 'PATCH' });
    fetchTasks();
  } else if (e.target.matches('.delete')) {
    const id = e.target.dataset.id;
    if (confirm('Excluir tarefa?')) {
      await fetch(`/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    }
  } else if (e.target.matches('.edit')) {
    const id = e.target.dataset.id;
    const title = prompt('Novo título');
    if (title !== null) {
      await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ title })
      });
      fetchTasks();
    }
  }
});

filterPriority.addEventListener('change', fetchTasks);
orderBy.addEventListener('change', fetchTasks);

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}

fetchTasks();
