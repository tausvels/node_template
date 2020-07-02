const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require('../models/user-model') // <-- Mongo User Model (USING MONGODB)
const userSFn = require("../dbHelpers/usersFn");  // <-- writing to pg (USING POSTGRESQL)


module.exports = db => {
  // ---- SERIALIZE THE USER USING ITS GOOGLE_ID TO BE PUT INTO COOKIE ------------ //
  passport.serializeUser((user, done) => {
    done(null, user.google_id);
  });

  // ---- DESERIALIZE THE COOKIE and USE THE ID TO FIND THAT PARTICULAR USER ------ //
  passport.deserializeUser((id, done) => {
    /** UNCOMMENT IF USING POSTGRESQL */
    userSFn.getUserByGoogleId(db, id).then(user => {
      done(null, user);
    });

    /** UNCOMMENT IF USING MONGODB */
    // User.find({google_id: id}).then(user => {done(null, user[0])}).catch(e=>console.error(e))
  });

  // ---- OAUTH SECTION ----------------------------------------------------------- //
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/users/auth/google/redirect"
      },
      async (accessToken, refreshToken, profile, done) => { // <-- Passport Callback func
      /** UNCOMMENT IF POSTRESQL  */
      // --------------------------------------------------------------------------- //
      
        try {
          const existingUser = await userSFn.getUserByGoogleId(db, profile.id);
          if (existingUser) {
            return done(null, existingUser);
          } else {
            userSFn.addNewUser(db, {
              username: profile.displayName,
              email: profile.emails[0].value,
              google_id: profile.id,
              thumbnail: profile.photos[0].value 
            }).then(newUser => {
              console.log(newUser);
              done(null, newUser);
            })
          } 
        } catch (error) {
          console.error(error)
          done(null)
        }
      
      // ------------------------------------------------------------------------- //
      //** UNCOMMENT IF USING MONGODB */------------------------------------------ //
        /*
        try {
          // check existing user
          await User.findOne({google_id: profile.id})
          .then(currentUser => {
            if (currentUser) {
              console.log('EXISTING USER --> ', currentUser);
              done(null, currentUser)
            } else {
              new User({
                username: profile.displayName,
                email:  profile.emails[0].value,
                google_id: profile.id,
                thumbnail: profile.photos[0].value
              }).save().then(newUser => {
                console.log('NEW USER --> ',newUser)
                done(null, newUser);
              })
            }
          })
        } catch (error) {
          console.error(error)
          done(null);
        }
        */
      // --------------------------------------------------------------------------- //

      }
    )
  );
};
