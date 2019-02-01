const mongoose = require('mongoose');
const ChecklistItem = require('./checklist-item-model');

const checklistSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    creation_date: {type: Date, default: Date.now()},
    item_data: [ChecklistItem.checklistItemSchema]
});

const Checklist = mongoose.model('Checklist', checklistSchema);

module.exports = Checklist;