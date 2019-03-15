module.exports = (req, res, next) => {
  try{
    const { operatingUserRole, operatedUserRole } = req.userData;

    if (operatingUserRole === 'admin' && operatedUserRole !== 'admin') return next();

    return res.status(400).json({ message: 'Access denied!' });
  } catch (err) {
    return res.status(500).json(err.message);
  }
}