const express = require('express');
const userController = require('../controllers/user-controller');
const operatedUserRoleCheck = require('../middlewares/operated-user-role-check');
 
const router = new express.Router();

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUsers);
router.put('/users/:id/status', operatedUserRoleCheck, userController.statusChange);
router.put('/users/:id/role', userController.roleChange);
router.delete('/users/:id', operatedUserRoleCheck, userController.deleteUser);

module.exports = router;
