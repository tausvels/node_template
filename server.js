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
const mongoose = require('mongoose');
const passport = require('passport');

// ---- INITIALIZING THE SERVER ----------------- //
const server = express();
// ---- INITIALIZING THE DATABASE(POSTGRESQL) --- //
// UNCOMMENT AFTER FILLING THE .env FILE WITH DATABASE CREDENTIALS
const { Pool } = require('pg');
const dbParams = require('./lib/db');
const db = new Pool(dbParams);
db.connect();

// ---- INITIALIZING THE DATABASE(MONGODB) --- //
// UNCOMMENT AFTER FILLING THE .env FILE WITH DATABASE CREDENTIALS
mongoose.connect(process.env.mongoDbURI, () => {
  console.log('MongoDB Connected');
})

require ('./service/passport')(db);

/**---- HANDLING USER LOGGING IN -------------- // */
server.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [process.env.sessionCookieEncryptionKey]  // <-- Encryption key for secure cookie
  })
);
server.use(passport.initialize())
server.use(passport.session());
// -------------------------------------------- //

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

// ---- SETUP THE DIFFERENT PATHS IN THE ROUTES HERE -------- // <-- DEFINES ALL URL ROUTES
const indexRoute = require('./routes/indexRoute');
const usersRoutes = require('./routes/usersRoutes');

// ---- SETUP THE DIFFERENT PATHS IN THE SERVICE HERE ------- // <-- CONTAINS ALL OTHER COMPLEX BUSINESS LOGIC
const usersServiceFactory = require('./service/usersServices');

// ---- SETUP THE DIFFERENT PATHS IN THE REPOSITORY HERE ---- // 
const usersRepositoryFactory = require('./repository/usersRepository');

// ---- SETTING UP THE REPOSITORY AND SERVICE TO BE USED BY ROUTE -- //
const usersRepository = usersRepositoryFactory(db); // 
// const usersRepository = usersRepositoryFactory();
const userService = usersServiceFactory(usersRepository);

// ---- SERVER ROUTING -------------------------------------- // 
server.use('/users', usersRoutes(userService));

// ---- HOME PAGE ------------------------------------------- //
// server.use('/', indexRoute);
server.get('/', (req,res)=>{
    if(!req.user){
      res.redirect('/users/login')
    } else {
      console.log(req.user[0])
      res.render('index.ejs', {userObj: req.user[0]})
    }
});
server.get('/sample', (req, res) => {
  res.send('Inside the sample page'); // <==== outputs the string in the page
});

// ---- START THE SERVER ------------------------------------ //
server.listen(port, () => {
  console.log(`The server is listening on port ${port}`)
});