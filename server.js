//server.js
//this now only has the const defs and then calls the router
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const uuidv4 = (...args) =>
  import('uuid').then(({ v4 }) => v4(...args));
const pdfDiscovery = require('./modules/pdfDiscovery');
const pdfValidation = require('./modules/pdfValidation');
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


const pdfDirectory = path.join(__dirname, 'pdfs');
let pdfList = pdfDiscovery.getPdfList();
const metadata = require('./data/pdfMetadata.json');

// Apply custom router
const setupRouter = require('./modules/router');
function getCurrentUser(req) {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessions[sessionId] && sessions[sessionId].expires > Date.now()) {
    return sessions[sessionId].user;
  }
  return null;
}

//routes
setupRouter(app, {
  getCurrentUser,
  pdfDirectory,
  pdfList,
  pdfValidation,
  users,
  comments,
  sessions,
  uuidv4,
  metadata
});


app.listen(PORT, () => {
    //console.log('Server running on http://toastcode.net/tschotter_node');
});
