const express = require('express');
const userController = require('../controllers/user-controller');
const userChartController = require('../controllers/user-chart-controller');
const operatedUserCheck = require('../middlewares/operated-user-check');
 
const router = new express.Router();

router.get('/users', userController.getUsers);
router.get('/users/today', userChartController.getMadeTodayUsers);
router.get('/users/week', userChartController.getUsersForWeek);
router.get('/users/month', userChartController.getUsersForMonth);
router.get('/users/year', userChartController.getUsersForYear);
router.get('/users/:id', userController.getUsers);
router.put('/users/:id/status', operatedUserCheck, userController.statusChange);
router.put('/users/:id/role', operatedUserCheck, userController.roleChange);
router.delete('/users/:id', operatedUserCheck, userController.deleteUser);

module.exports = router;
