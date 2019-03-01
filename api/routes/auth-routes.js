const express = require('express');
const authController = require('../controllers/auth-controller');
const router = new express.Router();
const passport = require('passport');

const url = 'http://localhost:3000';

router.post('/signup', authController.signUp);

router.post('/signin', authController.signIn);

router.post('/validate', authController.validateUser);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/redirect',
  passport.authenticate('google', { failureRedirect: `${url}/auth/signin` }),
  authController.socialAuth);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/redirect',
  passport.authenticate('facebook', { failureRedirect: `${url}/auth/signin` }),
  authController.socialAuth);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/redirect',
  passport.authenticate('github', { failureRedirect: `${url}/auth/signin` }),
  authController.socialAuth);

module.exports = router;
