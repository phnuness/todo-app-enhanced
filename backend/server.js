const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend')); // serve frontend estatico quando subir junto

// GET /tasks - lista tarefas, com filtros opcionais via query (priority, completed)
app.get('/tasks', (req, res) => {
  const { priority, completed, orderBy } = req.query;
  let sql = 'SELECT * FROM tasks';
  const where = [];
  const params = [];

  if (priority) {
    where.push('priority = ?');
    params.push(priority);
  }
  if (typeof completed !== 'undefined') {
    where.push('completed = ?');
    params.push(completed === '1' || completed === 'true' ? 1 : 0);
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');

  if (orderBy === 'due_date') {
    sql += ' ORDER BY due_date IS NULL, due_date ASC';
  } else {
    sql += ' ORDER BY created_at DESC';
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /tasks - cria tarefa
app.post('/tasks', (req, res) => {
  const { title, description, priority = 'medium', due_date = null } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const sql = `INSERT INTO tasks (title, description, priority, due_date) VALUES (?, ?, ?, ?)`;
  db.run(sql, [title, description, priority, due_date], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.status(201).json(row);
    });
  });
});

// PUT /tasks/:id - edita tarefa inteira
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, priority, due_date, completed } = req.body;
  const sql = `UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, completed = ? WHERE id = ?`;
  db.run(sql, [title, description, priority, due_date, completed ? 1 : 0, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// PATCH /tasks/:id/complete - alterna completed
app.patch('/tasks/:id/complete', (req, res) => {
  const { id } = req.params;
  db.get('SELECT completed FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'not found' });
    const newVal = row.completed ? 0 : 1;
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [newVal, id], function (e) {
      if (e) return res.status(500).json({ error: e.message });
      res.json({ id, completed: newVal });
    });
  });
});

// DELETE /tasks/:id
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
