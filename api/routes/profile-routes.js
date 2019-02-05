const express = require('express');
const profileController = require('../controllers/profile-cotroller');
const router = new express.Router();

router.get('/profile', profileController.getProfile);
router.post('/profile', profileController.updateProfile);

module.exports = router;
