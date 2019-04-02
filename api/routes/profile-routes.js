const express = require('express');
const profileController = require('../controllers/profile-controller');
const avatarController = require('../controllers/avatar-controller');
const authCheck = require('../middlewares/auth-check');

const router = new express.Router();

router.put('/', authCheck, profileController.updateProfile);
router.put('/updatePassword', authCheck, profileController.updateUserPassword);
router.post('/avatar', authCheck, avatarController.avatarUploadMulter, avatarController.avatarUploadBase64);

module.exports = router;
