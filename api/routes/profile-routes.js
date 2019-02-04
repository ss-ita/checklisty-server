const express = require('express');
const profileController = require('../controllers/profile-cotroller');
const router = new express.Router();

router.post('/profile', profileController.updateProfile);

router.post('/profile', profileController.getProfile);

module.exports = router;