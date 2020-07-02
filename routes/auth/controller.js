const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const passportSetup = require('../../config/passport-setup');
const { authenticate } = require('passport');

module.exports = service => {
  passportSetup(service);

  const checkAuthenticated = (req, res, next) => {
    // home page //
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('http://localhost:8001/login')
      // res.send('no user')
    }
  };

  const checkNotAuthenticated = (req, res, next) => {
    // login and register
    if (req.isAuthenticated()) {
      res.redirect('http://localhost:8001');
    } else {
      return next();
    }
  };

  router.get('/', async (req, res) => {
    console.log('in the auth controller');
    try {
      const result = await service.getAllUsers();
      res.send(result.rows)
    } catch (err) {
      console.log(err)
    }
  });

  router.post('/register', async (req, res) => {
    console.log("req.user from /register: ", req.user);
    console.log("submiited value: ", req.body);
    try {
      let user = {...req.body};
      // bcrypt password
      const hashedPw = await bcrypt.hash(user.password, 10);
      user.password = hashedPw;
      console.log('creating the user --> ', user);
      const result = await service.createUserWithEmailPW(user);
      if (result === 'userExists') {
        res.status(400).send('Email already exists');
      }
      res.send(result);
    } catch (err) {
      throw new Error('ERR FROM /register: ' + err);
    }
  });

  router.post('/login', passport.authenticate('local'), (req, res) => {
    console.log("req.user from /login: ", req.user);
    console.log("submiited value: ", req.body);
    res.send(req.user);
  });

  router.get('/logout', (req, res) => {
    console.log('user --> ', req.user);
    req.logOut();
    res.redirect('http://localhost:8001');
  })

  // GOOGLE Auth
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
  }));

  router.get('/google/redirect', passport.authenticate('google', {failureRedirect: "/"} ), async (req,res) => {
    console.log('from google auth --> ', req.user);
    // res.redirect('http://localhost:8001')
    res.render('index.ejs', {userObj: req.user})
  });

  router.get('user', (req, res) => {
    console.log('user from /user --> ', req.user);
    res.send(req.user)
  })
  return router;
}
