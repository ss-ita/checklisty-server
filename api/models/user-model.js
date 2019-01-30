const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    gender: {type: String},
    team: {type: String},
    location:{type: String}
})

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema);

module.exports = User;
