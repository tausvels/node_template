const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const passportSetup = require('../../config/passport-setup');

const transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {user: process.env.EMAIL, pass: process.env.PASSWORD},
});

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

  router.post('/login', passport.authenticate('local', {failureRedirect: '/login-failure'}), (req, res) => {
    // res.send(req.user);
    if (req.user) {
      res.render('index.ejs', {userObj: req.user})
    } else {
      res.send('invalid user')
    }
  });

  router.post('/activate', async (req, res) => {
    const user = {...req.body};
    const result = await service.findUser('email', user.email);
    if (result.rows[0]) return res.status(400).json({msg: 'THE EMAIL ADDRESS IS ALREADY IN USE'})
    const token = jwt.sign({...user}, process.env.JWT_ACC_ACTIVATE, {expiresIn: '30m'});
    const mailOptions = {
      from: `noreply@domainofTausif.com`,
      to: `${user.email}`,
      subject: 'Account activation email',
      html: `
        <h3>Thank you for registering, click the link below to activate your account.</h3>
        <a href='http://localhost:8001/auth/register/${token}'>${token}</a>
      `
    };
    // send mail //
    transporter.sendMail(mailOptions, function(err, data) {
      if (err) {
        console.error(err)
        return res.status(400).json({msg: err.message})
      } else {
        res.status(200).json({msg:'SUCCESS...NOW CHECK YOUR E-MAIL AND SIGN IN'});
      }
    });
  });

// ------------------- ALL GET ROUTES ------------------------------------------------------------- //
  router.get('/register/:token', async (req, res) => {
    const token = req.params.token;
    if (token) {
      // decode the jwt token
      jwt.verify(token, process.env.JWT_ACC_ACTIVATE, async function(err, decodedToken) {
        if (err) {
          return res.status(400).json({error: err.message})
        } else {
          // console.log(decodedToken);
          try {
            const user = {...decodedToken};
            // bcrypt password
            const hashedPw = await bcrypt.hash(user.password, 10);
            user.password = hashedPw;
            const result = await service.createUserWithEmailPW(user);
            // res.send(result);
            res.render("index.ejs", {userObj: result})
          } catch (err) {
            throw new Error('ERR FROM /register: ' + err);
          }
        }
      })
    } else {
      return res.status(400).json({msg: 'Token expired or broken. Please re-register'})
    }
  });


  router.get('/', async (req, res) => {
    console.log('in the auth controller');
    try {
      const result = await service.getAllUsers();
      res.send(result.rows)
    } catch (err) {
      console.log(err)
    }
  });

  router.get('/logout', (req, res) => {
    // console.log('user --> ', req.user);
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
