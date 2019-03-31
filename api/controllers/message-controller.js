const { Message } = require('../models/team/message-model');

const getAllMessages = async (req, res) => {
  try {
    const { id: teamId } = req.params;

    const messages = await Message.find({ teamId })
      .sort({ _id: 1 })

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error.message);
  }
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

module.exports = { getAllMessages, editMessage, deleteMessage };
