const User = require('../models/user-model');

const updateProfile = async (req, res) => {
    try {
        const { id, user } = req.body;
        const updateUserInfo = await User.findByIdAndUpdate(id, {$set: user });

        return res.status(200).json(updateUserInfo);
    } catch (err) {
        res.status(500).json(err);
    }
}

const getProfile = async (req, res) => {
    try{
        const { id } = req.body;
        const {password, ...user} = await User.findById(id);
        return res.status(200).json(user);
    } catch (err){
        res.status(500).json(err);
    }
}

module.exports = { updateProfile, getProfile };
