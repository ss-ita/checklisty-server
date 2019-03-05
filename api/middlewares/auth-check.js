const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        if (req.headers['access-token']) {
            const decoded = jwt.verify(req.headers['access-token'], process.env.JWT_KEY);
            req.userData = decoded;
            next();
        } else res.sendStatus(401);
    }
    catch(err){
        return res.sendStatus(401);
    }
}
