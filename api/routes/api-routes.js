const express = require('express');
const authRouter = require('./auth-routes');
const checkListRouter = require('./checklists-routers');
const profileRouter = require('./profile-routes');
const authCheck = require('../middlewares/auth-check');
const roleRoutes = require('./role-routes');
const roleCheck = require('../middlewares/role-check');

const router = new express.Router();

router.use('/auth', authRouter);
router.use('/checklists', checkListRouter);
router.use('/profile', authCheck, profileRouter);
router.use('/admin-tools', authCheck, roleCheck, roleRoutes);

module.exports = router;
