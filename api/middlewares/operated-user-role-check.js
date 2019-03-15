module.exports = async (req, res, next) => {
  try{
    if (!req.body.operatedUserId) return res.status(400).json({ message: 'access denied' });

    const { operatingUserRole, operatedUserRole } = req.userData;

    if (operatedUserRole === 'admin') return res.status(400).json({ message: 'Access denied!'});
    if (operatedUserRole === 'moderator' && operatingUserRole !== 'admin') return res.status(400).json({ message: 'Access denied!'});

    return next();
  } catch (err) {
    return res.status(500).json(err.message);
  }
}
