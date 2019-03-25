const { Message } = require('../models/team/message-model');
const { Team } = require('../models/team/team-model');

const sendMessage = async (req, res) => {
  const { id: sender } = req.userData;
  const { id: teamId } = req.params;
  const { text } = req.body;

  let team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ message: 'Team not found' });

  let message = new Message({ sender, teamId, text });

  await message.save();

  message = await Message.populate(message, {path: 'sender', select: 'username'});

  res.status(200).json(`message send ${message}`);
};

module.exports = { sendMessage };
