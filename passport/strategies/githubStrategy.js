const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;
const { User } = require('../../api/models/user-model');
const usernameCheck = require('../tools/usernameCheck');

module.exports = {
  githubStrategy: passport.use(
    new GithubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/redirect",
      scope: ['user:email']
    }, (accessToken, refreshToken, profile, done) => {
      User.findOne({ email: profile.emails[0].value }).then((currentUser) => {
        if (!currentUser) {
          new User({
            githubId: profile.id,
            username: usernameCheck(profile.displayName),
            email: profile.emails[0].value,
            image: profile.photos[0].value
          }).save().then((newUser) => {
            done(null, newUser);
          });
        } else {
          if (currentUser.githubId && currentUser.image) {
            done(null, currentUser);
          }
          if (!currentUser.githubId || !currentUser.image) {
            if (!currentUser.githubId) {
              currentUser.githubId = profile.id;
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
