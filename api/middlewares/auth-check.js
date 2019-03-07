const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    if (req.headers['access-token']) {
      const decoded = await jwt.verify(req.headers['access-token'], process.env.JWT_KEY);
      req.userData = decoded;
      next();
    } else return res.status(401).json({ message: 'Access token is absent!' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}
