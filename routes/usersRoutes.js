const express = require("express");
const router = express.Router();
const passport = require("passport");

module.exports = userService => {
  router.get("/getusers", (req, res) => { // <-- use this url to get all the users from the postgres db
    userService
      .getAllUser()
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  });

  router.get("/login", (req, res) => {
    userService.getAllUser()
    .then(data => {
      if (data.rows) {
        console.log(data.rows)
        res.render("login.ejs", {dbStatus: true})
      }
    })
    .catch(e => {
      console.log('DB NOT CONNECTED')
      res.render("login.ejs", {dbStatus: false})
    })
  });

  // auth with google
  router.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"] // <-- information you want to get from google
    })
  );

  router.get(
    "/auth/google/redirect",
    passport.authenticate("google"),
    (req, res) => {
      const userObj = req.user;
      // res.send(userObj);
      res.redirect("/");
    }
  );

  // auth logout
  router.get("/auth/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
  });

  router.get("/auth/current_user", (req, res) => {
    res.send(req.user);
  });

  return router;
};
