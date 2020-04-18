const express = require("express");
const router = express.Router();
const passport = require("passport");

module.exports = userService => {
  router.get("/getuser", (req, res) => {
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
    res.render("login.ejs")
  })
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
      const userObj = req.user[0];
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
