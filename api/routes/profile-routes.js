const express = require('express');
const profileController = require('../controllers/profile-cotroller');
const router = new express.Router();

router.get('/', profileController.getProfile);
router.post('/', profileController.updateProfile);

module.exports = router;
