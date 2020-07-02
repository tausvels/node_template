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
const cookieSession = require('cookie-session');
const cors = require('cors');
// const mongoose = require('mongoose');
const flash = require('express-flash');
const passport = require('passport');

// ---- INITIALIZING THE SERVER ----------------- //
const server = express();

// ---- INITIALIZING THE DATABASE(POSTGRESQL) --- //
// UNCOMMENT AFTER FILLING THE .env FILE WITH DATABASE CREDENTIALS
const { Pool } = require('pg');
const dbParams = require('./lib/db');
const db = new Pool(dbParams);
db.connect();


// ---- INITIALIZING THE DATABASE(POSTGRESQL) --- //
// UNCOMMENT AFTER FILLING THE .env FILE WITH DATABASE CREDENTIALS // 
// ALSO UPDATE THE PASSPORT.JS ACCORDINGLY  ----- //
// const db2 = mongoose.connect(process.env.mongoDbURI, () => {console.log('Connected to MongoDB')});

// ------------------------------------------------------------------------------------------- //
const corsOptions = {credentials: true, origin: true};
server.use(cors(corsOptions));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(express.static('public'));
server.use(flash());
server.use(cookieSession({
  maxAge: 24*60*60*1000,
  keys:[process.env.COOKIE_KEY]
}))

server.use(morgan('dev'));
server.use('/styles', sass({
  src: __dirname + '/styles',
  dest: __dirname + '/public/styles',
  debug: true,
  outputStyle: 'expanded'
}));

// ---- USING THE PASSPORT TO SET THE USER FOR THE SERVER AND SETTING THE COOKIE ------------- //
const passportSetup = require('./config/passport-setup');
// ---- INITIALIZE PASSPORT AND USE IT FOR SESSION ----------- //
server.use(passport.initialize())
server.use(passport.session());
server.set('view engine', 'ejs');

// * ROUTES * //
const AuthModule = require('./routes/auth');
const UserModule = require('./routes/users');

server.use('/users', UserModule(db));
server.use('/auth', AuthModule(db));

// ---- HOME PAGE ------------------------------------------- //
server.get('/', (req, res) => {
  // if user exists
  if (req.user) { 
    res.render('index.ejs', {userObj: req.user}); // <===== Renders the index.ejs in the views
  } else {
    // res.redirect('/users/login');
    // res.redirect('/')
    res.render('index.ejs', {userObj: req.user})
  };
});

// ---- START THE SERVER ------------------------------------ //
server.listen(port, () => {
  console.log(`The server is listening on port ${port}`)
});