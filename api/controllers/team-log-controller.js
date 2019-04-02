const userChecklists = require('../models/checklists/users-checklists')

const teamLogConnect = (socket, io) => {
  socket.on('handle-checklist-change', (data) => {
    io.sockets.emit('emit-data', data);
    saveLogMessage(data);
  });
}

const saveLogMessage = async data => {
  const result = await userChecklists.findById(data.id);
  result.checkboxes_data = data.arrayOfCheckboxArray;
  result.teamLog = data.messages;
  result.save();
}

module.exports = {
  teamLogConnect
};
