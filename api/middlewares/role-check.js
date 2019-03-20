const { User } = require('../models/user-model');

module.exports = async (req, res, next) => {
  try {
    const operatingUser = await User.findById(req.userData.id);

    if (operatingUser.role !== 'admin' && operatingUser.role !== 'moderator') {
      return res.status(403).json({ message: 'Access denied!'});
    }

    if (req.params.id) { 
      const operatedUser = await User.findById(req.params.id);
      
      if (!operatedUser) return next();

      req.userData.operatedUserRole = operatedUser.role;
      req.userData.operatedUserBanStatus = operatedUser.isBanned;
    }
    req.userData.operatingUserRole = operatingUser.role;

    return next();

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
