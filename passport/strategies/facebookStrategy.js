const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const { User } = require('../../api/models/user-model');
const transliterator = require('../tools/usernameCheck');
const uniqueUsernameSearch = require('../tools/uniqueUsernameSearch');

module.exports = {
  facebookStrategy: passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL:
          'https://summer-brand-232313.appspot.com/api/auth/facebook/redirect',
        profileFields: ['id', 'displayName', 'picture.type(large)', 'email']
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
                facebookId: profile.id,
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
          if (currentUser.facebookId && currentUser.image) {
            done(null, currentUser);
          }
          if (!currentUser.facebookId || !currentUser.image) {
            if (!currentUser.facebookId) {
              currentUser.facebookId = profile.id;
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
