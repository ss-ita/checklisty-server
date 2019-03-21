const express = require('express');
const teamController = require('../controllers/team-controller');


const router = new express.Router();

router.get('/:id', teamController.getTeam);
router.post('/', teamController.createTeam);

module.exports = router;
