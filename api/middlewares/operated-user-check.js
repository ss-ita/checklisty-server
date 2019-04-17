const { User } = require('../models/user-model');

module.exports = async (req, res, next) => {
  try {
    const operatedUser = await User.findById(req.params.id);
      
    if (!operatedUser) return res.status(403).json({ message: 'Access-denied!' });

    req.userData.operatedUserBlockStatus = operatedUser.isBlocked;

    return next();

  } catch (err) {
    return res.sendStatus(500);
  }
}
