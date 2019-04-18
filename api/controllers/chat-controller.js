const { Message } = require('../models/team/message-model');
const checkMessage = require('../utils/chat-msg-validation');

const chatConnect = (socket, io) => {
  let teamRoom;
  let connectedUser;
  let connectedUsersNames;
  let roomSockets;
  let connectedUserNumber;

  socket.on('joinRoom', ({ teamId, username }) => {
    teamRoom = teamId;
    connectedUser = username;
    socket.username = connectedUser;
    socket.join(teamRoom);

    roomSockets = io.sockets.adapter.rooms[teamRoom];
    connectedUserNumber = roomSockets.length;

    const clients = Object.keys(roomSockets.sockets);
    connectedUsersNames = clients.map((id) => {
      return io.sockets.connected[id].username;
    });

    io.to(teamRoom).emit('onlineUsers', connectedUsersNames);
    io.to(teamRoom).emit('connectedUserNumber', connectedUserNumber);
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
    connectedUsersNames.splice(connectedUsersNames.indexOf(connectedUser), 1);
    
    io.to(teamRoom).emit('onlineUsers', connectedUsersNames);

    socket.username = connectedUser;
    connectedUserNumber = roomSockets ? roomSockets.length : 0;

    io.to(teamRoom).emit('connectedUserNumber', connectedUserNumber);
    socket.broadcast.to(teamRoom).emit('userDisconnection', socket.username);
  });
};

const saveMessage = async messageData => {
  const { username, avatar, message, teamId, createdAt } = messageData;

  const messageInfo = new Message({ username, avatar, message, teamId, createdAt });

  await messageInfo.save();
};

module.exports = chatConnect;
