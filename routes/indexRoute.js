const express = require("express");
const router = express.Router();
const passport = require("passport");


module.exports = () => {
  router.get('/', (req,res) => {
    res.render('index.ejs')
  });


  return router;
};