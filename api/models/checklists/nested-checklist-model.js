const mongoose = require('mongoose');

const nestedChecklistSchema = new mongoose.Schema({
  title: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPrivate: { type: Boolean, default: false },
  checklists_data: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Checklist' }]
}, { timestamps: true });

const nestedChecklist = mongoose.model('nestedChecklist', nestedChecklistSchema);

module.exports = { nestedChecklist };
