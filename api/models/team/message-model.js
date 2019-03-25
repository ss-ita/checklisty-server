const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    text: String,
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
