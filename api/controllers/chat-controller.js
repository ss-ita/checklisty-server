const { Message } = require('../models/team/message-model');
const checkMessage = require('../utils/chatMsgValidation');

const chatConnect = (socket, io) => {
  let teamRoom;
  let connectedUser;

  socket.on('joinRoom', ({ teamId, username }) => {
    teamRoom = teamId;
    connectedUser = username;

    socket.join(teamRoom);
  });

  socket.on('message', data => {
    const validMsg = checkMessage(data.message);

    if (!validMsg) {
      return;
    }

    io.to(teamRoom).emit('message', data);
    saveMessage(data);
  });

  socket.on('typing', user => {
    socket.broadcast.to(teamRoom).emit('typing', user);
  });

  socket.on('userConnection', () => {
    socket.broadcast.to(teamRoom).emit('userConnection', connectedUser);
  });

  socket.on('disconnect', () => {
    socket.username = connectedUser;
    socket.broadcast.to(teamRoom).emit('userDisconnection', socket.username);
  });
};

const saveMessage = async messageData => {
  const { username, avatar, message, teamId, createdAt } = messageData;

  const messageInfo = new Message({ username, avatar, message, teamId, createdAt });

  await messageInfo.save();
};

module.exports = chatConnect;
