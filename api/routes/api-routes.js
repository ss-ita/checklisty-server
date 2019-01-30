const express = require('express');
const authRouter = require('./auth-routes');
const router = new express.Router();

router.use('/auth', authRouter);

module.exports = router;
