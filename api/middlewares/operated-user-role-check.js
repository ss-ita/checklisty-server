module.exports = async (req, res, next) => {
  try{
    if (!req.params.id) return res.status(403).json({ message: 'Access denied' });

    const { operatingUserRole, operatedUserRole } = req.userData;

    if (operatedUserRole === 'admin') return res.status(403).json({ message: 'Access denied!'});
    if (operatedUserRole === 'moderator' && operatingUserRole !== 'admin') return res.status(403).json({ message: 'Access denied!'});

    return next();
  } catch (err) {
    return res.status(500);
  }
}
