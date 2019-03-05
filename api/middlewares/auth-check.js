const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (req.headers['access-token']) {
        const { err, decoded } = jwt.verify(req.headers['access-token'], process.env.JWT_KEY);
        if (err) return res.sendStatus(401);
        req.userData = decoded;
        next();
    } else res.sendStatus(401)
}
