const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    gender: {type: String},
    team: {type: String},
    location:{type: String}
})

userSchema.plugin(uniqueValidator);

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
      {
        _id: this._id,
        name: this.username,
        email: this.email,
        isAdmin: this.isAdmin
      },
      process.env.JWT_KEY
    );
    return token;
  };

const User = mongoose.model('User', userSchema);

module.exports = User;
