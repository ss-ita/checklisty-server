const sendEmail = require('../utils/send-email');
const { User } = require('../models/user-model');
const { blockedOrDeletedEmail } = require('../utils/email-generator');

const statusChange = async (req, res) => {
  try {
    const { id: operatedUserId } = req.params;
    const { userStatus = 'blocked' } = req.query;

    const statusChangedUser = await User.findByIdAndUpdate(
      operatedUserId,
      { $set: { isBlocked: userStatus === 'blocked' ? true : false } },
      { new: true }
    );

    sendEmail({ emailGenerator: blockedOrDeletedEmail, userEmail: statusChangedUser.email, subjectOption: `You was ${userStatus}!`,
      username: statusChangedUser.username, userOrList: 'you', blockedOrDeleted: userStatus });

    return res.status(200).json({ message: `${statusChangedUser.username} is successfuly ${statusChangedUser.isBlocked ? 'blocked' : 'unblocked'}!`});
  } catch (err) {
    return res.sendStatus(500);
  }
}

const roleChange = async (req, res) => {
  try {
    const { operatedUserBlockStatus } = req.userData;

    if (operatedUserBlockStatus) return res.status(403).json( { message: 'You can not give moderator rights to blocked user!'});

    const { id: operatedUserId } =  req.params;
    const { userRole = 'user' } = req.query;

    const updatedUser = await User.findByIdAndUpdate(
      operatedUserId,
      { $set: { role: userRole === 'user' ? userRole : 'moderator' } },
      { new: true } 
    );

    return res.status(200).json(`${updatedUser.username} role was changed to ${updatedUser.role}!`);
  } catch (err) {
    return res.sendStatus(500);
  }
}

const getUsers = async (req, res) => {
  try {
    if (req.params.id) return res.status(200).json(await User.findById(req.params.id).select('-password'));

    let { searchQuery = 'username', search = '', page = 1, perPage = 10, sortQuery = 'username' } = req.query;
    let order = 1;

    if (sortQuery[0] === '-' ) {
      order = -1;
      sortQuery = sortQuery.slice(1);
    }

    const totalUsers = await User.count({ [searchQuery]: { $regex: `${search}`, $options: 'i' } });

    if (perPage > totalUsers) {
      perPage = totalUsers;
      page = 1;
    }

    let totalPages = Math.ceil(totalUsers / perPage);

    if (page > totalPages) {
      page = totalPages;
    }

    const usersPerPage = await User.find(
      { [searchQuery]: { $regex: `${search}`, $options: 'i' } }
    ).collation({ locale: 'en'}).select('-password').sort({ [sortQuery]: order }).skip(Number(perPage) * ( page - 1 )).limit(Number(perPage));

    return res.status(200).json({ usersPerPage, totalPages }); 
  } catch (err) {
    return res.sendStatus(500);
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id: operatedUserId } = req.params;
    const deletedUser = await User.findByIdAndDelete(operatedUserId);

    sendEmail({ emailGenerator: blockedOrDeletedEmail, userEmail: deletedUser.email, subjectOption: 'You was deleted!',
      username: deletedUser.username, userOrList: 'you', blockedOrDeleted: 'deleted' });

    return res.status(200).json({ message: 'User successfuly deleted!'});
  } catch (err) {
    return res.sendStatus(500);
  }
}

module.exports = { roleChange, deleteUser, statusChange, getUsers };
