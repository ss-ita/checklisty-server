const mongoose = require('mongoose');
const Section = require('./section-model');

const checklistSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, ref: 'User' },
    creation_date: { type: Date, default: Date.now() },
    items_data: [Section.sectionSchema]
});

const Checklist = mongoose.model('Checklist', checklistSchema);

module.exports = Checklist;
