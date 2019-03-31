const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    username: String,
    avatar: String,
    message: String,
    createdAt: String,
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', },
  },
);

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
