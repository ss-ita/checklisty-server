const { User } = require('../models/user-model');

const getUsers = async (req, res) => {
  try {
    const { itemsonpage: itemsOnPage = 5, currentpage: currentPage = 1, sortquery: sortQuery = 'username' } = req.headers;
    const usersPerPage = await User.find().sort({ [sortQuery]: -1 }).skip(Number(itemsOnPage) * ( currentPage - 1 )).limit(Number(itemsOnPage));
    const totalPages = Math.ceil(await User.count() / itemsOnPage);

    return res.status(200).json({ usersPerPage, totalPages });

  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const searchUsers = async (req, res) => {
  try{
    const seachUserValue = req.params.searchUser;
    const getSearchUsers = await User.find({ "username": {$regex: `${seachUserValue}`, $options: 'i'} });
    return res.status(200).json(getSearchUsers);
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

module.exports = {getUsers, searchUsers};