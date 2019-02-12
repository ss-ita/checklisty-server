const express = require('express');
const profileController = require('../controllers/profile-cotroller');
const avatarUpload = require('../controllers/avatar-controller');
const router = new express.Router();

router.get('/', profileController.getProfile);
router.post('/', profileController.updateProfile);
router.post('/avatar', avatarUpload);

module.exports = router;
