const mongoose = require('mongoose');
const ChecklistItem = require('./checklist-item-model');

const sectionSchema = new mongoose.Schema({
    section_title: { type: String },
    items_data: [ChecklistItem.checklistItemSchema]
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = { sectionSchema, Section };
