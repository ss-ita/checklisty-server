const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  item_title: { type: String },
  description: { type: String },
  details: { type: String },
  tags: [{ type: String }],
  //----------------------------------------------------------------------------
  //------------------------Number type for priority----------------------------
  //0 - low priority(green), 1 - medium priority(yellow), 2 - high priority(red)
  //----------------------------------------------------------------------------
  priority: { type: Number }
})

const ChecklistItemModel = mongoose.model('ChecklistItem', checklistItemSchema);

module.exports = { checklistItemSchema, ChecklistItemModel };
