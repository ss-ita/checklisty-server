const { User, validate } = require('../models/user-model');
const bcrypt = require('bcryptjs');

const updateProfile = async (req, res) => {
    try {
        const userId = req.userData.id;
        const user = await User.findById(userId);
        const userParams = { username: req.body.username, email: req.body.email };
        const { error } = validate(req.body);
        if (error) return res.status(400).json({message: error.details[0].message});
        if (user.username === req.body.username) delete userParams.username;
        if (user.email === req.body.email) delete userParams.email;
        if(!Object.keys(userParams).length) return res.status(409).json({message: "Please fill the form!"});
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$set: userParams},
            { runValidators: true, context: 'query' }
        ).select('-password');
        res.status(200).json({ updatedUser, message: 'Name and email changed!' });
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
        const { error } = validate(req.body.oldPassword);
        if (error) return res.status(400).json({message: error.details[0].message});
        const { error1 } = validate(req.body.newPassword);
        if (error1) return res.status(400).json({message: error1.details[0].message});
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
