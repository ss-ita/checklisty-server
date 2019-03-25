const express = require('express');
const teamController = require('../controllers/team-controller');
const messageController = require('../controllers/message-controller');

const router = new express.Router();

router.get('/:id', teamController.getTeam);
router.get('/join/team=:teamId&user=:userId', teamController.joinTeam);
router.post('/', teamController.createTeam);
router.post('/invite', teamController.inviteMember);
router.post('/:id', messageController.sendMessage);

module.exports = router;
