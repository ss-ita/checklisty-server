const { User } = require('../models/user-model');

const getUsers = async (req, res) => {
  try {
    const { itemsonpage = 5, currentpage = 1, sortquery = 'username' } = req.headers;
    const usersPerPage = await User.find().sort({ [sortquery]: -1 }).skip(Number(itemsonpage) * ( currentpage - 1 )).limit(Number(itemsonpage));
    const totalPages = Math.ceil(await User.count() / itemsonpage);

    return res.status(200).json({ usersPerPage, totalPages });
        
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

module.exports = getUsers;
