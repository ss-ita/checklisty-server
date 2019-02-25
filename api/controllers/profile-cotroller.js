const { User } = require('../models/user-model');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');
const mongoose = require('mongoose');

const updateProfile = async (req, res) => {
    try {
        const userId = req.userData.id;
        const user = await User.findById(userId);
        const userSchema = mongoose.Schema({
            username: { type: String, unique: true },
            email: { type: String, index: true, unique: true },
        });
        userSchema.plugin(uniqueValidator);
        if (user.username === req.body.username) await User.findByIdAndUpdate(
            userId,
            { email: req.body.email },
            { runValidators: true, context: 'query' }
        );
        else if (user.email === req.body.email) await User.findByIdAndUpdate(
            userId,
            { username: req.body.username },
            { runValidators: true, context: 'query' }
        );
        else await User.findOneAndUpdate(
            userId,
            { username: req.body.username, email: req.body.email },
            { runValidators: true, context: 'query' }
        );
        res.status(200).json({ message: 'Name and email changed!' });
    } catch (err) {
        if (err.name === 'ValidationError') res.status(409).json(err);
        else res.status(500).json(err);
    }
}

const getProfile = async (req, res) => {
    try{
        const id = req.userData.id;
        const user = await User.findById(id).select('-password');

        return res.status(200).json(user);
    } catch (err){
        res.status(500).json(err);
    }
}

const updateUserPassword = async (req, res) => {
    try{
        const userId = req.userData.id;
        const user = await User.findById(userId);
        const validPassword = bcrypt.compareSync(req.body.oldPassword, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid old password!'});
        const salt = bcrypt.genSaltSync(10);
        const newPassword = bcrypt.hashSync(req.body.newPassword, salt);
        await User.findByIdAndUpdate(userId, { $set: { password: newPassword } });
        res.status(200).json({ message: 'Password changed!' });
    } catch(err){
        res.status(500).json(err);
    }
}

module.exports = { updateProfile, getProfile, updateUserPassword };
