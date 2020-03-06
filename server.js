// ---- LOAD env variables from the .env file ---- //
require ('dotenv').config();

// ---- WEB SERVER CONFIG ------------------------ //
const port = process.env.PORT || 8000;
const ENV = process.env.ENV || 'development';
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sass = require('node-sass-middleware');
const morgan = require('morgan');
const cors = require('cors');

// ---- INITIALIZING THE SERVER ----------------- //
const server = express();

// ---- INITIALIZING THE DATABASE(POSTGRESQL) --- //
// UNCOMMENT AFTER FILLING THE .env FILE WITH DATABASE CREDENTIALS
/*
const { Pool } = require('pg');
const dbParams = require('./lib/db');
const db = new Pool(dbParams);
db.connect();
*/

server.use(cors());
server.use(cookieParser());
server.use(morgan('dev'));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use('/styles', sass({
  src: __dirname + '/styles',
  dest: __dirname + '/public/styles',
  debug: true,
  outputStyle: 'expanded'
}));
server.use(express.static('public'));

server.set('view engine', 'ejs');

// ---- SETUP THE DIFFERENT PATHS IN THE ROUTES HERE -------- //
// ---- SETUP THE DIFFERENT PATHS IN THE SERVICE HERE ------- //
// ---- SETUP THE DIFFERENT PATHS IN THE REPOSITORY HERE ---- //

// ---- HOME PAGE ------------------------------------------- //
server.get('/', (req, res) => {
  res.render('index.ejs') // <===== Renders the index.ejs in the views
});
server.get('/sample', (req, res) => {
  res.send('Inside the sample page'); // <==== outputs the string in the page
});

// ---- START THE SERVER ------------------------------------ //
server.listen(port, () => {
  console.log(`The server is listening on port ${port}`)
});