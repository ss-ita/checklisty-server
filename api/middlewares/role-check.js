const { User } = require('../models/user-model');

module.exports = async (req, res, next) => {
  try {
    const operatingUser = await User.findById(req.userData.id);
    
    if (operatingUser.role !== 'admin' && operatingUser.role !== 'moderator') {
      return res.status(403).json({ message: 'Access denied!'});
    }
    
    req.userData.operatingUserRole = operatingUser.role;

    return next();

  } catch (err) {
    return res.sendStatus(500);
  }
}
