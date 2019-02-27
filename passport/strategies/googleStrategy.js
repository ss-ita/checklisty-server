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
    }, (accessToken, refreshToken, profile, done) => {
      User.findOne({ email: profile.emails[0].value }).then((currentUser) => {
        if (!currentUser) {
          new User({
            googleId: profile.id,
            username: usernameCheck(profile.displayName),
            email: profile.emails[0].value,
            image: profile._json.image.url.replace("?sz=50", "?sz=500")
          }).save().then((newUser) => {
            done(null, newUser);
          });
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
      });
    })
  )
}
