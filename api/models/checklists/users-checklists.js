const mongoose = require('mongoose');

const userChecklistsSchema = new mongoose.Schema({
  userID: { type: String },
  checklistID: { type: String },
  checklistData: { type: mongoose.Schema.Types.ObjectId, ref: 'Checklist' },
  checkboxes_data: [[]],
});

const userChecklists = mongoose.model('userChecklists', userChecklistsSchema);

module.exports = userChecklists;
