const express = require('express');
const authRouter = require('./auth-routes');
const checkListRouter = require('./checklists-routers');
const profileRouter = require('./profile-routes');
const router = new express.Router();

router.use('/auth', authRouter);
router.use('/checklists', checkListRouter);
router.use('/profile', profileRouter);

module.exports = router;
