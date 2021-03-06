const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../../api/models/user-model');
const transliterator = require('../tools/usernameCheck');
const uniqueUsernameSearch = require('../tools/uniqueUsernameSearch');

module.exports = {
  googleStrategy: passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          (process.env.SERVER_URL || 'http://localhost:3030') +
          '/api/auth/google/redirect',
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
      },
      async (accessToken, refreshToken, profile, done) => {
        const currentUser = await User.findOne({
          email: profile.emails[0].value
        });
        if (!currentUser) {
          let correctUsername = transliterator.usernameCheck(
            profile.displayName
          );
          let readyToCreate = false;

          while (!readyToCreate) {
            const temporalUser = await User.findOne({
              username: correctUsername
            });

            if (temporalUser) {
              correctUsername = uniqueUsernameSearch(correctUsername);
            } else {
              new User({
                firstname: transliterator.nameCheck(profile.name.givenName),
                lastname: transliterator.nameCheck(profile.name.familyName),
                googleId: profile.id,
                username: correctUsername,
                email: profile.emails[0].value,
                image: profile.photos[0].value
              })
                .save()
                .then(newUser => {
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
              currentUser.image = profile.photos[0].value;
            }
            currentUser.save();
            done(null, currentUser);
          }
        }
      }
    )
  )
};
