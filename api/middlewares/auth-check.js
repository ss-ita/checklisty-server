const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');

module.exports = async (req, res, next) => {
  try {
    if (req.headers['access-token']) {
      const decoded = await jwt.verify(req.headers['access-token'], process.env.JWT_KEY);
      req.userData = decoded;

      const user = await User.findById(decoded.id);

      if (user.isBlocked) return res.status(401).json({ message: 'You are blocked!' });

      return next();
    } else return res.status(401).json({ message: 'Access token is absent!' });
  } catch (err) {
    return res.status(500).json({ message: 'Something go wrong' });
  }
}
