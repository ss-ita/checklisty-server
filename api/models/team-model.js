const mongoose = require('mongoose');

const maxLength = 50;

const message = new mongoose.Schema({
  text: String,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamp: true });

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: maxLength,
    unique: true,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' ,
    required: true,
  },
  members: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    accepted: { 
      type: Boolean, 
      default: false,
    },
  }],
  messages: [{ message }],
});

const Team = new mongoose.model('Team', teamSchema);

module.exports = { Team };
