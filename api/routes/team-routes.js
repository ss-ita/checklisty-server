const express = require('express');
const teamController = require('../controllers/team-controller');
const messageController = require('../controllers/message-controller');


const router = new express.Router();

router.get('/searchUsers/searchUsers=:searchUser', teamController.searchUsers);
router.get('/team/:id', teamController.getTeam);
router.get('/myteams', teamController.getTeams);
router.get('/join/:token', teamController.joinTeam);
router.post('/', teamController.createTeam);
router.post('/invite', teamController.inviteMember);
router.delete('/:id', teamController.deleteTeam);
router.delete('/deletemember/:id', teamController.deleteMember);

router.get('/chat/:id', messageController.getAllMessages);
router.post('/chat/:id', messageController.sendMessage);
router.put('/chat/:id', messageController.editMessage);
router.delete('/chat/:id', messageController.deleteMessage);

module.exports = router;
