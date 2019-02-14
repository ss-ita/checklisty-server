const express = require('express');
const profileController = require('../controllers/profile-cotroller');
const avatarController = require('../controllers/avatar-controller');
const router = new express.Router();

router.get('/', profileController.getProfile);
router.post('/', profileController.updateProfile);
router.get('/avatar', avatarController.avatarGet);
router.post('/avatar', avatarController.avatarUpload);

module.exports = router;
