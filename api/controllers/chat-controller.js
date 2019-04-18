const { Message } = require('../models/team/message-model');

const chatConnect = (socket, io) => {
  let teamRoom;
  let connectedUser;
  let connectedUsersNames;

  socket.on('joinRoom', ({ teamId, username }) => {
    teamRoom = teamId;
    connectedUser = username;
    socket.username = connectedUser;
    socket.join(teamRoom);

    const clients = Object.keys(io.sockets.adapter.rooms[teamRoom].sockets);
    connectedUsersNames = clients.map((id) => {
      return io.sockets.connected[id].username;
    });

    io.to(teamRoom).emit('onlineUsers', connectedUsersNames);
  });

  socket.on('message', data => {
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

    socket.broadcast.to(teamRoom).emit('userDisconnection', socket.username);
  });
};

const saveMessage = async messageData => {
  const { username, avatar, message, teamId, createdAt } = messageData;

  const messageInfo = new Message({ username, avatar, message, teamId, createdAt });

  await messageInfo.save();
};

module.exports = chatConnect;
