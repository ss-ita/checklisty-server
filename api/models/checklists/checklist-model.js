const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Joi = require('joi');
const slug = require('mongoose-slug-updater');
const Section = require('./section-model');
const userChecklists = require('./users-checklists');
const { countpercentProgress } = require('../../controllers/viewed-checkist-controller');

const minLength = 1;
const maxLength = 256;
const maxDescLength = 1024;

mongoose.plugin(slug);

const checklistSchema = new mongoose.Schema({
  title: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPrivate: { type: Boolean, default: false },
  slug: { type: String, slug: "title", unique: true, slugPaddingSize: 2 },
  creation_date: { type: Date, default: Date.now() },
  sections_data: [Section.sectionSchema],
  copiedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

checklistSchema.plugin(uniqueValidator);

checklistSchema.methods.getTags = function() {
  const tags = [];
  this.sections_data.map(section => {
    section.items_data.map(el => {
      el.tags.map(item => {
        if (!tags.includes(item)) {
          tags.push(item);
        }
      })
    });
  });
  return tags
};

checklistSchema.methods.getProgress = async function(userID) {
  const list = await userChecklists.findOne({ userID, checklistID: this._id });
  const progress = list ? countpercentProgress(list.checkboxes_data) : 0;
  return progress;
};

const Checklist = mongoose.model('Checklist', checklistSchema);

const validateChecklist = (checklist) => {
  const schema = Joi.object().keys({
    title: Joi.string()
      .min(minLength)
      .max(maxLength)
      .required()
      .label('Checklist title'),
    isPrivate: Joi.boolean(),
    sections_data: Joi.array()
      .items(
        Joi.object({
          section_title: Joi.string()
            .min(minLength)
            .max(maxLength)
            .required()
            .label('Section title'),
          items_data: Joi.array()
            .items(
              Joi.object().keys({
                item_title: Joi.string()
                  .min(minLength)
                  .max(maxLength)
                  .required()
                  .label('Item title'),
                description: Joi.string()
                  .max(maxDescLength)
                  .allow('')
                  .optional()
                  .label('Item description'),
                tags: Joi.any().optional(),
                priority: Joi.number()
                  .required()
                  .label('Priority'),
                details: Joi.any().optional()
              })
            )
        })
      )
  });
  return Joi.validate(checklist, schema);
}

module.exports = { Checklist, validateChecklist };
