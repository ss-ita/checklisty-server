const Joi = require('joi');
const { Checklist } = require('../models/checklists/checklist-model');

const minLength = 1;
const maxLength = 256;

const validateSlug = (slug) => {
  const schema = Joi.string()
    .min(minLength)
    .max(maxLength)
    .regex(/^[-a-z0-9]+$/)
    .required()
    .label('Url');

  return Joi.validate(slug, schema);
}

const findAndUpdateSlug = async (req, res) => {
  try {
    const { id, newSlug } = req.body;

    const { error } = validateSlug(newSlug);
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    await Checklist.findByIdAndUpdate(
      id,
      { $set: { slug: newSlug } },
      { runValidators: true, context: 'query', new: true }
    )

    res.status(200).json({ message: 'Checklist url was sucessfully updated' });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(409).json({ message: 'Checklist with such url already exists' });
    }

    res.status(500).json(error);
  }
}

module.exports = { findAndUpdateSlug };
