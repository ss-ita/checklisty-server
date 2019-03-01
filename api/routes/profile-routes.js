const express = require('express');
const profileController = require('../controllers/profile-cotroller');
const avatarController = require('../controllers/avatar-controller');
const router = new express.Router();

router.put('/', profileController.updateProfile);
router.put('/updatePassword', profileController.updateUserPassword);
router.get('/avatar', avatarController.avatarGet);
router.post('/avatar', avatarController.avatarUpload);

module.exports = router;
