const { User } = require('../models/user-model');
const bcrypt = require('bcryptjs');

const updateProfile = async (req, res) => {
    try {
        const userId = req.userData.id;
        const allUsers = await User.find();

        if (req.body.name){
            const userSameName = allUsers.find((item) => {
                return userId !== item.id && (item.username === req.body.name || item.email === req.body.email);
            });
            if(userSameName){
                if (userSameName.username === req.body.name) 
                    return res.status(409).json({ message: 'User with that name already exists!' });
                if (userSameName.email === req.body.email)
                    return res.status(409).json({ message: 'User with that email already exists!' });
            }
            await User.findByIdAndUpdate(userId, { $set: { username: req.body.name, email: req.body.email } });
            res.status(200).json({ message: 'Name and email changed!' });
        }
        else {
            const user = await User.findById(userId);
            const validPassword = bcrypt.compareSync(req.body.oldPassword, user.password);
            if (!validPassword) return res.status(400).json({ message: 'Invalid old password!'});
            const salt = bcrypt.genSaltSync(10);
            const newPassword = bcrypt.hashSync(req.body.newPassword, salt);
            await User.findByIdAndUpdate(userId, { $set: { password: newPassword } });
            res.status(200).json({ message: 'Password changed!' });
        }
    } catch (err) {
        res.status(500).json(err);
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

module.exports = { updateProfile, getProfile };
