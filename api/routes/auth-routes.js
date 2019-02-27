const express = require('express');
const authController = require('../controllers/auth-controller');
const router = new express.Router();
const passport = require('passport');

router.post('/signup', authController.signUp);

router.post('/signin', authController.signIn);

router.post('/validate', authController.validateUser);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/redirect',
  passport.authenticate('google', { failureRedirect: '/api/auth/google' }),
  authController.socialController);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/redirect',
  passport.authenticate('facebook', { failureRedirect: '/api/auth/facebook' }),
  authController.socialController);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/redirect',
  passport.authenticate('github', { failureRedirect: '/api/auth/github' }),
  authController.socialController);

module.exports = router;
