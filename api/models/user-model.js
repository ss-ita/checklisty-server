/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const minLength = 6;
const maxLength = 15;

const userSchema = new mongoose.Schema({
    username: {
      type: String, 
      required: true,
      minlength: minLength,
      maxlength: maxLength,
      unique: true,
      validate: {
        validator: function(v) {
          return /^[a-zA-Z0-9_]*$/.test(v);
        },
        message: props => `${props.value} is not a valid name!`
      },
    },
    email: {
      type: String, 
      required: true,
      unique: true,
      validate: {
        validator: function(v) {
          return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      },
    },
    password: {
      type: String, 
      required: true,
    },
    team: {
      type: String
    },
    location:{
      type: String
    },
    image:{
        type: String
    }
})

userSchema.plugin(uniqueValidator);

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.username,
      email: this.email,
    },
    process.env.JWT_KEY
  );
  return token;
};

const User = mongoose.model('User', userSchema);

const validate = (user) => {
  const shema = {
    username: Joi.string()
      .min(minLength)
      .max(maxLength)
      .required(),
    email: Joi.string()
      .min(minLength)
      .email(),
    password: Joi.string()
    .min(minLength)
    .max(maxLength)
    .required()
  };
  return Joi.validate(user, shema);
}

module.exports = { User, validate };
