const passport = require('passport');
const { User } = require('../api/models/user-model');
const passportGoogle = require('./strategies/googleStrategy');
const passportGithub = require('./strategies/githubStrategy');
const passportFacebook = require('./strategies/facebookStrategy');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
});

passportGoogle.googleStrategy;

passportFacebook.facebookStrategy;

passportGithub.githubStrategy;
