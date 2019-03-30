const mongoose = require('mongoose');

const logMessage = new mongoose.Schema({
  userData: { type: Object },
  itemValue: { type: Boolean },
  forSection: { type: Boolean },
  title: { type: String },
  sectionTitle: { type: String },
  date: { type: Date, default: Date.now() },
  checklistData: { type: Object },
})

const userChecklistsSchema = new mongoose.Schema({
  userID: { type: String },
  teamID: { type: String },
  teamLog: [logMessage],
  checklistID: { type: String },
  checklistData: { type: mongoose.Schema.Types.ObjectId, ref: 'Checklist' },
  checkboxes_data: [[]],
});


const userChecklists = mongoose.model('userChecklists', userChecklistsSchema);

module.exports = userChecklists;
