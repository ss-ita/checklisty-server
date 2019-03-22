const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Joi = require('joi');
const slug = require('mongoose-slug-updater');
const Section = require('./section-model');

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
  sections_data: [Section.sectionSchema]
});

checklistSchema.plugin(uniqueValidator);

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
