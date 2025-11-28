//router.js
//this file now holds all the route functions to clean up the main server.js
const express = require('express');
const path = require('path');

module.exports = (app, deps) => {
    const router = express.Router();

    const {
        getCurrentUser,
        pdfDirectory,
        pdfList,
        pdfValidation,
        users,
        comments,
        sessions,
        uuidv4,
        metadata
    } = deps;
    
    
//gets
    // PDF list page
    router.get('/pdfs', (req, res) => {
        const user = getCurrentUser(req);
        if (!user) return res.redirect('/login');

        res.render('pdfs', {
            title: 'PDF Library',
            pdfs: pdfList
        });
    });

    // Serve actual PDF using sendFile()
    router.get('/pdfs/:filename', (req, res) => {
        const user = getCurrentUser(req);
        if (!user) return res.redirect('/login');

        const filename = req.params.filename;
        const filePath = path.join(pdfDirectory, filename);

        if (!pdfValidation.exists(pdfDirectory, filename)) {
            return res.status(404).send("PDF not found");
        }

        res.sendFile(filePath);
    });


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
        res.redirect('/index'); 
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
      
//posts
      app.post('/login', async (req, res) => {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) return res.render('login', { error: 'Invalid credentials' });
      
        const sessionId = await uuidv4();
        sessions[sessionId] = { user: username, expires: Date.now() + 3600000 }; // 1 hour
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

    // Attach to app
    app.use(router);
};
