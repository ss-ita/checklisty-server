const bcrypt = require('bcryptjs');
const { User, validate } = require('../models/user-model');

const updateProfile = async (req, res) => {
  try {
    const userId = req.userData.id;
    const user = await User.findById(userId);
    const userParams = { username: req.body.username, email: req.body.email };
        
    if(!userParams.username && !userParams.email) return res.status(409).json({message: "Please fill the form!"});
    
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
        
    return res.status(200).json({ updatedUser, message: 'Name and email changed!' });
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(409).json(err);
    else return res.sendStatus(500);
  }
}

const updateUserPassword = async (req, res) => {
  try {
    const userId = req.userData.id;
    const user = await User.findById(userId);
    const { newPassword, oldPassword } = req.body;

    if (oldPassword === newPassword) return res.status(400).json({ 
      message: 'Old and new passwords must be different!' 
    });

    const { error } = validate({ password: newPassword });
    if (error) return res.status(400).json({message: error.details[0].message});
        
    const validPassword = bcrypt.compareSync(oldPassword, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid old password!'});

    const salt = bcrypt.genSaltSync(10);
    const setNewPassword = bcrypt.hashSync(newPassword, salt);

    await User.findByIdAndUpdate(userId, { $set: { password: setNewPassword } });

    return res.status(200).json({ message: 'Password changed!' });
  } catch (err) {
    return res.sendStatus(500);
  }
}

module.exports = { updateProfile, updateUserPassword };
