const express = require('express');
const userController = require('../controllers/user-controller');
const operatedUserCheck = require('../middlewares/operated-user-check');
 
const router = new express.Router();

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUsers);
router.put('/users/:id/status', operatedUserCheck, userController.statusChange);
router.put('/users/:id/role', operatedUserCheck, userController.roleChange);
router.delete('/users/:id', operatedUserCheck, userController.deleteUser);

module.exports = router;
