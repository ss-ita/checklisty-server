const express = require('express');
const authRouter = require('./auth-routes');
const checkListRouter = require('./checklists-routers');
const profileRouter = require('./profile-routes');
const authCheck = require('../middlewares/auth-check');
const myTeamRouter = require('./myTeamRouter');

const router = new express.Router();

router.use('/myteam', myTeamRouter);
router.use('/auth', authRouter);
router.use('/checklists', checkListRouter);
router.use('/profile', authCheck, profileRouter);

module.exports = router;
