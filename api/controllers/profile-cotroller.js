const { User, validate } = require('../models/user-model');
const bcrypt = require('bcryptjs');

const updateProfile = async (req, res) => {
    try {
        const userId = req.userData.id;
        const user = await User.findById(userId);
        const userParams = { username: req.body.username, email: req.body.email };
        if(!Object.keys(userParams).length) return res.status(409).json({message: "Please fill the form!"});
        const { error } = validate(req.body);
        if (error) return res.status(400).json({message: error.details[0].message});
        if (user.username === req.body.username) delete userParams.username;
        if (user.email === req.body.email) delete userParams.email;
        if(!Object.keys(userParams).length) return res.status(409).json({message: "Please change username or email!"});
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$set: userParams},
            { runValidators: true, context: 'query', new: true }
        ).select('-password');
        res.status(200).json({ updatedUser, message: 'Name and email changed!' });
    } catch (err) {
        if (err.name === 'ValidationError') res.status(409).json(err);
        else res.status(500).json(err);
    }
}

const updateUserPassword = async (req, res) => {
    try {
        const userId = req.userData.id;
        const user = await User.findById(userId);

        if (req.body.oldPassword === req.body.newPassword) return res.status(400).json({ 
            message: 'Old and new passwords must be different!' });

        const { error } = validate({ password: req.body.newPassword });
        if (error) return res.status(400).json({message: error.details[0].message});

        const validPassword = bcrypt.compareSync(req.body.oldPassword, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid old password!'});

        const salt = bcrypt.genSaltSync(10);
        const newPassword = bcrypt.hashSync(req.body.newPassword, salt);

        await User.findByIdAndUpdate(userId, { $set: { password: newPassword } });

        res.status(200).json({ message: 'Password changed!' });
    } catch (err) {
        res.status(500).json(err);
    }
}

module.exports = { updateProfile, updateUserPassword };
