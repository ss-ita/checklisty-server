const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const { User } = require('../../api/models/user-model');
const usernameCheck = require('../tools/usernameCheck');

module.exports = {
  facebookStrategy: passport.use(
    new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/redirect",
      profileFields: ['id', 'displayName', 'picture.type(large)', 'email']
    }, (accessToken, refreshToken, profile, done) => {
      User.findOne({ email: profile.emails[0].value }).then((currentUser) => {
        if (!currentUser) {
          new User({
            facebookId: profile.id,
            username: usernameCheck(profile.displayName),
            email: profile.emails[0].value,
            image: profile.photos[0].value
          }).save().then((newUser) => {
            done(null, newUser);
          });
        } else {
          if (currentUser.facebookId && currentUser.image) {
            done(null, currentUser);
          }
          if (!currentUser.facebookId || !currentUser.image) {
            if (!currentUser.facebookId) {
              currentUser.facebookId = profile.id;
            }
            if (!currentUser.image) {
              currentUser.image = profile.photos[0].value
            }
            currentUser.save();
            done(null, currentUser);
          }
        }
      });
    })
  )
}
