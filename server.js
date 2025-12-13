//server.js
//this now only has the const defs and then calls the router
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const http = require('http'); 
const app = express();
const pdfDiscovery = require('./modules/pdfDiscovery');
const pdfValidation = require('./modules/pdfValidation');
const PORT = 3000;
const db = require('./db/database');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

// Set up Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register partials directory
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const pdfDirectory = path.join(__dirname, 'pdfs');
let pdfList = pdfDiscovery.getPdfList();
const metadata = require('./data/pdfMetadata.json');

// Apply custom router
const setupRouter = require('./modules/router');
const setupChats = require('./modules/chats');

//this checks if the user is logged in with a valid session Id



//routes
setupRouter(app, {
  pdfDirectory,
  pdfList,
  pdfValidation,
  metadata,
  db
});

setupChats(io, db);


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

