const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const maxLength = 50;

const message = new mongoose.Schema({
  text: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamp: true });

const sectionSchema = new mongoose.Schema({
  section_title: { type: String },
  items_data: [{
    item_title: { type: String },
    description: { type: String },
    details: { type: String },
    tags: [{ type: String }],
    priority: { type: Number }
  }]
});

const checklistSchema = new mongoose.Schema({
  title: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPrivate: { type: Boolean, default: true },
  slug: { type: String, slug: "title", unique: true, slugPaddingSize: 2 },
  sections_data: [sectionSchema]
}, { timestamp: true });

const teamSchema = new mongoose.Schema({
  name: { type: String, maxlength: maxLength, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId,  ref: 'User', required: true },
  slug: { type: String, slug: "name", unique: true, slugPaddingSize: 2 },
  requested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ message }],
  checklists: [{ checklistSchema }]
});

teamSchema.methods.convertToId = function (id) {
  return mongoose.Types.ObjectId(id);
};

const Team = new mongoose.model('Team', teamSchema);

module.exports = { Team };
