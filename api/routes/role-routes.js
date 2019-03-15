const express = require('express');
const roleController = require('../controllers/role-controller');
const getUsers = require('../controllers/get-users-controller');
const operatedUserRoleCheck = require('../middlewares/operated-user-role-check');
const adminCheck = require('../middlewares/admin-check');
 
const router = new express.Router();

router.get('/getUsers', getUsers);
router.put('/banUser', operatedUserRoleCheck, roleController.banUser);
router.put('/unbanUser', operatedUserRoleCheck, roleController.unbanUser);
router.delete('/deleteUser', operatedUserRoleCheck, roleController.deleteUser);
router.delete('/deleteCheckList', roleController.deleteCheckList);
router.put('/giveModeratorRights', adminCheck, roleController.giveModeratorRights);
router.put('/takeBackModeratorRights', adminCheck, roleController.takeBackModeratorRights);

module.exports = router;
