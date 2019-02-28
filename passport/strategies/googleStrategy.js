const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../../api/models/user-model');
const usernameCheck = require('../tools/usernameCheck');

module.exports = {
  googleStrategy: passport.use(
    new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/redirect"
    }, async (accessToken, refreshToken, profile, done) => {
      const currentUser = await User.findOne({ email: profile.emails[0].value });
      if (!currentUser) {
        let correctUsername = usernameCheck(profile.displayName);
        let i = 0, readyToCreate = false;

        while (!readyToCreate) {

          const temporalUser = await User.findOne({ username: correctUsername });
          
          if (temporalUser) {
            const pattern = /\d+$/gm;
            
            if (correctUsername.match(pattern)) {
              let numOfUsername = correctUsername.match(pattern);
              numOfUsername = Number(numOfUsername[0]) + 1;
              correctUsername = correctUsername.replace(pattern, numOfUsername);
            } else {
              correctUsername = correctUsername + i;
            }
            
          } else {
            new User({
              googleId: profile.id,
              username: correctUsername,
              email: profile.emails[0].value,
              image: profile._json.image.url.replace("?sz=50", "?sz=500")
            }).save().then((newUser) => {
              done(null, newUser);
            });
            readyToCreate = true;
          }
        }
      } else {
        if (currentUser.googleId && currentUser.image) {
          done(null, currentUser);
        }
        if (!currentUser.googleId || !currentUser.image) {
          if (!currentUser.googleId) {
            currentUser.googleId = profile.id;
          }
          if (!currentUser.image) {
            currentUser.image = profile._json.image.url.replace("?sz=50", "?sz=500")
          }
          currentUser.save();
          done(null, currentUser);
        }
      }
    })
  )
}
