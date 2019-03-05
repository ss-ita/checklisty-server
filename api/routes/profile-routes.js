const express = require('express');
const profileController = require('../controllers/profile-cotroller');
const avatarController = require('../controllers/avatar-controller');
const router = new express.Router();

router.put('/', profileController.updateProfile);
router.put('/updatePassword', profileController.updateUserPassword);
router.post('/avatar', avatarController.avatarUploadMulter, avatarController.avatarUploadBase64);

module.exports = router;
