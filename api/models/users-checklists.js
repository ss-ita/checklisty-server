const mongoose = require('mongoose');

const userChecklistsSchema = new mongoose.Schema({
  userID: { type: String },
  checklistID: { type: String },
  checkboxes_data: [[]],
});

const userChecklists = mongoose.model('userChecklists', userChecklistsSchema);

module.exports = userChecklists;
