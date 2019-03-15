const { User } = require('../models/user-model');

module.exports = async (req, res, next) => {
  try {
    const operatingUser = await User.findById(req.userData.id);

    if (operatingUser.role !== 'admin' && operatingUser.role !== 'moderator') {
      return res.status(400).json({ message: 'Access denied!'});
    }

    if (req.body.operatedUserId) { 
      const operatedUser = await User.findById(req.body.operatedUserId);
      req.userData.operatedUserRole = operatedUser.role;
      req.userData.operatedUserBanStatus = operatedUser.isBanned;
    }
    req.userData.operatingUserRole = operatingUser.role;

    return next();

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}
