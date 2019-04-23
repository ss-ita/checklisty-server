const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;
const { User } = require('../../api/models/user-model');
const transliterator = require('../tools/usernameCheck');
const uniqueUsernameSearch = require('../tools/uniqueUsernameSearch');

module.exports = {
  githubStrategy: passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:
          'https://check-listy.herokuapp.com/api/auth/github/redirect',
        scope: ['user:email']
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
          if (currentUser.githubId && currentUser.image) {
            done(null, currentUser);
          }
          if (!currentUser.githubId || !currentUser.image) {
            if (!currentUser.githubId) {
              currentUser.githubId = profile.id;
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
