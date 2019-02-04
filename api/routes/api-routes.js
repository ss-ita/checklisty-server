const express = require('express');
const authRouter = require('./auth-routes');
const checkListRouter = require('./checklists-routers');
const router = new express.Router();

router.use('/auth', authRouter);
router.use('/checklists', checkListRouter);

module.exports = router;
