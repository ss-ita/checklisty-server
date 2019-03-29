const socket = require('socket.io');
const { Message } = require('../models/team/message-model');
const { Team } = require('../models/team/team-model');

const chatConnect = async (server) => {
  const io = socket(server);
  const chatSpace = io.of('/team-chat');
  const teamsIDs = await getTeamsIDs();

  chatSpace.on('connection', (socket) => {

    socket.on('joinRoom', (messageData, teamRoom) => {
      if (teamsIDs.includes(teamRoom)) {
        socket.join(teamRoom)

        saveMessage(messageData);

        return chatSpace.emit('message', messageData);
      }
    });

    socket.on('typing', user => {
      socket.broadcast.emit('typing', user)
    });
  });
}

const getTeamsIDs = async () => {
  let teamsIDs = await Team.find().select('_id');

  teamsIDs = teamsIDs.map(el => el._id.toString());

  return teamsIDs;
}

const saveMessage = async messageData => {
  const { username, avatar, message, teamId } = messageData;

  const messageInfo = new Message({ username, avatar, message, teamId });

  await messageInfo.save();
};

module.exports = chatConnect;
