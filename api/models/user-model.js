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
    },
    password: {
      type: String, 
    },
    googleId:{
      type: String
    },
    facebookId:{
      type: String
    },
    githubId:{
      type:String
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
      id: this._id,
    },
    process.env.JWT_KEY,
    { expiresIn: '30d' }
  );
  return token;
};

const User = mongoose.model('User', userSchema);

const validate = (user) => {
  const shema = {
    username: Joi.string()
      .max(maxLength)
      .regex(/^[a-zA-Z0-9_]*$/)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
    .min(minLength)
    .max(maxLength),
  };
  return Joi.validate(user, shema);
}

module.exports = { User, validate };