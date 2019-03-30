const express = require('express');
const teamController = require('../controllers/team-controller');
const messageController = require('../controllers/message-controller');

const router = new express.Router();

router.get('/team/:id', teamController.getTeam);
router.get('/join/:token', teamController.joinTeam);
router.get('/:id/checklists', teamController.getTeamChecklists);
router.post('/', teamController.createTeam);
router.post('/invite', teamController.inviteMembers);
router.post('/inviteOne', teamController.inviteMember);

router.get('/chat/:id', messageController.getAllMessages);
router.post('/chat/:id', messageController.sendMessage);
router.put('/chat/:id', messageController.editMessage);
router.delete('/chat/:id', messageController.deleteMessage);

module.exports = router;
