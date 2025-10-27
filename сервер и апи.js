const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Поддержка JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// База данных в памяти (для демо; в продакшене — файл)
let bookings = {};
let users = {
  yulia: { pass: '12345678', name: 'Юля', role: 'user' },
  oleg: { pass: '12345678', name: 'Олег', role: 'user' },
  sasha: { pass: '12345678', name: 'Саша', role: 'user' },
  ayk: { pass: '12345678', name: 'Айк', role: 'user' },
  admin: { pass: 'admin', name: 'Админ', role: 'admin' }
};

// API: вход
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (user && user.pass === password) {
    res.json({ success: true, user: { login: username, name: user.name, role: user.role } });
  } else {
    res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
  }
});

// API: получить брони
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// API: забронировать
app.post('/api/book', (req, res) => {
  const { key, user, date, hour } = req.body;
  if (bookings[key]) {
    return res.status(400).json({ error: 'Слот уже занят' });
  }
  // Проверка лимита 60 часов
  let userHours = 0;
  for (const k in bookings) {
    if (bookings[k].user === user && bookings[k].status === 'confirmed') userHours++;
  }
  if (userHours >= 60) {
    return res.status(400).json({ error: 'Лимит 60 часов исчерпан' });
  }
  bookings[key] = { user, status: 'pending', date, hour };
  res.json({ success: true });
});

// API: подтвердить/отклонить
app.post('/api/confirm', (req, res) => {
  const { key, approve } = req.body;
  if (approve) {
    if (bookings[key]) bookings[key].status = 'confirmed';
  } else {
    delete bookings[key];
  }
  res.json({ success: true });
});

// Главная страница
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});