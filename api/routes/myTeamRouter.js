
const express = require('express');

const router = new express.Router();
const getUsers = require('../controllers/user-controller');

router.get('/searchUsers=:searchUser', getUsers.searchUsers);

module.exports = router;