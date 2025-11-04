
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const PORT = 3000;


let users = [];
let comments = [];
let sessions = {};
let isloggedIn = false;


// Set up Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register partials directory
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes

function getCurrentUser(req) {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessions[sessionId] && sessions[sessionId].expires > Date.now()) {
    return sessions[sessionId].user;
  }
  return null;
}


app.get('/index', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.redirect('/login');
    res.render('index', {
        title: 'Welcome to Our Site',
        message: 'This is a Handlebars template!'
    });
});
app.get('/', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.redirect('/login');
    res.render('/login', {
        title: 'Welcome to Our Site',
        message: 'This is a Handlebars template!'
    });
});
app.get('/read', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.redirect('/login');
    res.render('read', {
        title: 'Welcome to Our Site',
        message: 'This is a Handlebars template!'
    });
});
app.get('/upcoming', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.redirect('/login');
    res.render('upcoming', {
        title: 'Welcome to Our Site',
        message: 'This is a Handlebars template!'
    });
});

app.get('/bookreviews', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.redirect('/login');
    res.render('bookreviews', {
        title: 'Welcome to Our Site',
        message: 'This is a Handlebars template!'
    });
});

app.get('/login', (req, res) => {
  res.render('login', {
      title: 'Welcome to Our Site',
      message: 'This is a Handlebars template!'
  });
});

app.get('/logout', (req, res) => {
  res.render('logout', {
      title: 'Welcome to Our Site',
      message: 'This is a Handlebars template!'
  });
});

app.get('/register', (req, res) => {
  res.render('register', {
      title: 'Welcome to Our Site',
      message: 'This is a Handlebars template!'
  });
});

app.get('/comments', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.redirect('/login');
  res.render('comments', { title: 'Comments', comments, user });
});

app.get('/comment/new', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.redirect('/login');
  res.render('newComment', { title: 'New Comment', user });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.render('login', { error: 'Invalid credentials' });

  const sessionId = uuidv4();
  sessions[sessionId] = { user: username, expires: Date.now() + 3600000 }; // 1 hour
  isloggedIn = true;
  res.cookie('sessionId', sessionId);
  res.redirect('/index');
});

app.post('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) delete sessions[sessionId];
  res.clearCookie('sessionId');
  res.redirect('/login');
});



app.post('/comment', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.redirect('/login');

  const { text } = req.body;
  comments.push({ author: user, text, createdAt: new Date() });
  res.redirect('/comments');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.render('register', { error: 'Username already taken' });
  }
  users.push({ username, password });
  res.redirect('/login');
});

app.listen(PORT, () => {
    console.log('Server running on http://toastcode.net/tschotter_node');
});
