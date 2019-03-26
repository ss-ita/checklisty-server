const { Message } = require('../models/team/message-model');
const { Team } = require('../models/team/team-model');

const sendMessage = async (req, res) => {
  const { id: sender } = req.userData;
  const { id: teamId } = req.params;
  const { text } = req.body;

  let team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ message: 'Team not found' });

  let message = new Message({ sender, text, teamId });

  message = await Message.populate(message, {path: 'sender', select: 'username'});

  message = await message.save();
  
  res.status(200).json(message);
};

const getAllMessages = async (req, res) => {
  const { id: teamId } = req.params; 

  const messages = await Message.find({ teamId })
    .populate({ path: 'sender', select: 'username' })
    .sort({ createdAt: 1 })

  res.status(200).json(messages);
};

const editMessage = async (req, res) => {
  const { id: messageId } = req.params;
  const { text } = req.body;

  const message = await Message.findOneAndUpdate({ _id: messageId }, { text }, { new: true });

  res.status(200).json(message);
};

const deleteMessage = async (req, res) => {
  const { id: messageId } = req.params;

  await Message.findOneAndRemove({ _id: messageId });
  res.status(200).json({ message: 'Message deleted' });
};
 

module.exports = { sendMessage, getAllMessages, editMessage, deleteMessage };
