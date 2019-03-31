// const socket = require('socket.io');
const { Message } = require('../models/team/message-model');

const chatConnect = (socket, io) => {
  let teamRoom;

  socket.on('joinRoom', room => {
    teamRoom = room;
    socket.join(room);
  })

  socket.on('message', data => {
    saveMessage(data);
    io.sockets.in(teamRoom).emit('message', data);
  })

  socket.on('typing', typedUser => {
    socket.broadcast.to(teamRoom).emit('typing', typedUser)
  })
};

const saveMessage = async messageData => {
  const { username, avatar, message, teamId } = messageData;

  const messageInfo = new Message({ username, avatar, message, teamId });

  await messageInfo.save();
};

module.exports = chatConnect;
