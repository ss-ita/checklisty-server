const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const minLength = 6;
const maxLength = 50;

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, maxlength: maxLength },
    lastname: { type: String, required: true, maxlength: maxLength },
    username: { type: String, required: true, maxlength: maxLength, unique: true },
    email: { type: String, required: true, unique: true },
    password: String,
    googleId: String,
    facebookId: String,
    githubId: String,
    team: String,
    location: String,
    image: String,
    role: { type: String, enum: ['admin', 'moderator', 'user'], default: 'user'},
    copiedLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Checklist' }],
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);

userSchema.methods.generateAuthToken = function(expireTime = '30d') {
  const token = jwt.sign(
    {
      id: this._id
    },
    process.env.JWT_KEY,
    { expiresIn: expireTime }
  );
  return token;
};

const User = mongoose.model('User', userSchema);

const validate = user => {
  const schema = {
    firstname: Joi.string()
      .max(maxLength)
      .regex(/^[a-zA-Z ]*$/),
    lastname: Joi.string()
      .max(maxLength)
      .regex(/^[a-zA-Z ]*$/),
    username: Joi.string()
      .max(maxLength)
      .regex(/^[a-zA-Z0-9_]*$/),
    email: Joi.string().email(),
    password: Joi.string()
      .min(minLength)
      .regex(/^[\w[\]!#$%&'*+\-/=?^`{|}~|\s]*$/)
      .max(128),
  };
  return Joi.validate(user, schema);
};

module.exports = { User, validate };
