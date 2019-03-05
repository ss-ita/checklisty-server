const mongoose = require('mongoose');
const Section = require('./section-model');
const Joi = require('joi');

const minLength = 1;
const maxLength = 256;
const maxDescLength = 1024;

const checklistSchema = new mongoose.Schema({
  title: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creation_date: { type: Date, default: Date.now() },
  sections_data: [Section.sectionSchema]
});

const Checklist = mongoose.model('Checklist', checklistSchema);

const validateChecklist = (checklist) => {
  const schema = Joi.object().keys({
    title: Joi.string()
      .min(minLength)
      .max(maxLength)
      .required()
      .label('Checklist title'),
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
                  .min(minLength)
                  .max(maxDescLength)
                  .required()
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
