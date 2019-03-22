const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const minLength = 6;
const maxLength = 50;

const userSchema = new mongoose.Schema({
  username: {
    type: String, 
    required: true,
    maxlength: maxLength,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  creation_date: { 
    type: Date, 
    default: Date.now() 
  },
  password: {
    type: String,
  },
  googleId: {
    type: String
  },
  facebookId: {
    type: String
  },
  githubId: {
    type: String
  },
  team: {
    type: String
  },
  location: {
    type: String
  },
  image: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'user'],
    default: 'user',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

userSchema.plugin(uniqueValidator);

userSchema.methods.generateAuthToken = function (expireTime = '30d') {
  const token = jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_KEY,
    { expiresIn: expireTime }
  );
  return token;
};

const User = mongoose.model('User', userSchema);

const validate = (user) => {
  const shema = {
    username: Joi.string()
      .max(maxLength)
      .regex(/^[a-zA-Z0-9_]*$/),
    email: Joi.string()
      .email(),
    password: Joi.string()
      .min(minLength)
      .regex(/^[\w[\]!#$%&'*+\-/=?^`{|}~|\s]*$/)
      .max(128)
  };
  return Joi.validate(user, shema);
}

module.exports = { User, validate };