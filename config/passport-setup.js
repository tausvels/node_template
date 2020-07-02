const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
// const User = require('../models/user-model') // <-- Mongo User Model (USING MONGODB)
// const userSFn = require("../dbHelpers/usersFn");  // <-- writing to pg (USING POSTGRESQL)


module.exports = service => {
  // ---- SERIALIZE THE USER USING ITS GOOGLE_ID TO BE PUT INTO COOKIE ------------ //
  passport.serializeUser((user, done) => {console.log('serialize running --> ', user)
    done(null, user.id);
  });

  // ---- DESERIALIZE THE COOKIE and USE THE ID TO FIND THAT PARTICULAR USER ------ //
  passport.deserializeUser( async (id, done) => {
    /** UNCOMMENT IF USING POSTGRESQL */
    try {
      const result = await service.findUser("id", id);
      const user = result.rows[0];
      done(null, user)
    } catch (err) {
      console.log('err from deserialize --> ', err)
    }

    /** UNCOMMENT IF USING MONGODB */
    // User.find({google_id: id}).then(user => {done(null, user[0])}).catch(e=>console.error(e))
  });

  // ---- OAUTH SECTION ----------------------------------------------------------- //
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/redirect"
      },
      async (accessToken, refreshToken, profile, done) => { // <-- Passport Callback func
      /** UNCOMMENT IF POSTRESQL  */
      // --------------------------------------------------------------------------- //
      
        try {
          const existingUser = await service.authWith_g_id(profile);
          //this is what is being sent to the serializeUser and also in /redirect as req.user
          done(null, existingUser); 
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

  const authenticateUser = async (email, password, done) => {
    console.log('authenticate user ran');
    const result = await service.findUser('email', email);
    
    const user = result.rows[0];console.log('user==> ' , user)
    if (!user) {
      return done(null, false, { message: 'User does not exist with that email address'});
    }
    if (!user.confirmed) {
      return done(null, false, {message: 'You need to verify your email'})
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        done(null, false, {message: 'Incorrect password or email'});
      }
    } catch (err) {
      return done(err)
    }
  };

  passport.use( new LocalStrategy({
    usernameField: 'email',
  }, authenticateUser));

  return passport;
};
