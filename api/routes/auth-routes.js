const express = require('express');
const authController = require('../controllers/auth-controller');
const forgotPasswordController = require('../controllers/forgot-password-controller');
const router = new express.Router();
const passport = require('passport');

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

router.post('/signup', authController.signUp);

router.post('/signin', authController.signIn);

router.post('/validate', authController.validateUser);

router.post('/forgot-password', forgotPasswordController.forgotPassword);

router.post('/reset-password', forgotPasswordController.resetPassword);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/redirect',
  passport.authenticate('google', { failureRedirect: `${baseURL}/auth/signin` }),
  authController.socialAuth);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/redirect',
  passport.authenticate('facebook', { failureRedirect: `${baseURL}/auth/signin` }),
  authController.socialAuth);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/redirect',
  passport.authenticate('github', { failureRedirect: `${baseURL}/auth/signin` }),
  authController.socialAuth);

module.exports = router;
