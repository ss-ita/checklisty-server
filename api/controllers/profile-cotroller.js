const { User } = require('../models/user-model');
const bcrypt = require('bcryptjs');

const updateProfile = async (req, res) => {
    try {
        let user = req.body.values;
        const updatedUser = {
            username: user.username,
            email: user.email,
            password: user.newPassword
        };
        //const user1 = await User.findOne({ email });
        //const validPassword = await bcrypt.compareSync(user.oldPassword, user1.password);
        const salt = bcrypt.genSaltSync(10);
        updatedUser.password = await bcrypt.hashSync(updatedUser.password, salt);
        const updateUserInfo = await User.findByIdAndUpdate(req.userData._id, {$set: updatedUser });
        return res.status(200).json(updateUserInfo);
    } catch (err) {
        res.status(500).json(err);
    }
}

const getProfile = async (req, res) => {
    try{
        const user = await User.findById(req.userData._id).select("-password");
        if (!user) res.status(404).json({message: "User not found!"});

        return res.status(200).json(user);
    } catch (err){
        res.status(500).json(err);
    }
}

module.exports = { updateProfile, getProfile };
