const router = require('express').Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

let transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {user: process.env.EMAIL, pass: process.env.PASSWORD},
});


module.exports = () => {

  router.get('/', (req, res) => {
    res.render('sendmail.ejs')
  })

  router.post('/', (req, res) => {
    const info = req.body;
    const {name, message} = req.body
    console.log('info --> ', info)
    
    // json web token
    const token = jwt.sign({name, message}, process.env.JWT_ACC_ACTIVATE, {expiresIn: '20m'});
    
    let mailOptions = {
      from: `noreply@gmail.com`,
      to: `${info.email}`,
      subject: 'Account activation email',
      html: `
      <h2>Please click on the given link to activate account</h2>
      <a href='http://localhost:8001/send/activate/${token}'>${token}</a>
      `
    }
    transporter.sendMail(mailOptions, function(err, data) {
      if (err) {
        console.error(err)
        res.status(400).json({msg: `FAILED: ${err.message}` });
      } else {
        res.send('SUCCESS!!!')
      }
    })
  });

  router.get('/activate/:token', (req, res) => {
    const token = req.params.token;
    if (token) {
      // verification of the jwt
      jwt.verify(token, process.env.JWT_ACC_ACTIVATE, function(err, decodedToken) {
        if (err) {
          res.status(400).json({error: err.message})
        } else {
          console.log(decodedToken)
          res.status(200).json(decodedToken)
        }
      })
    } else {
      res.send(400).json({msg: 'Token expired or broken. Re-register'})
    }
    
  })


  return router;
}