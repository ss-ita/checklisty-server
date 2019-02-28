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
              acebookId: profile.id,
              username: correctUsername,
              email: profile.emails[0].value,
              image: profile.photos[0].value
            }).save().then((newUser) => {
              done(null, newUser);
            });
            readyToCreate = true;
          }
        }
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
    })
  )
}
