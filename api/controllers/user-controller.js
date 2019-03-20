const sendEmail = require('../utils/send-email');
const { User } = require('../models/user-model');
const { bannedOrDeletedEmail } = require('../utils/email-generator');

const statusChange = async (req, res) => {
  try {
    const { id: operatedUserId } = req.params;
    const { userStatus = 'blocked' } = req.query;

    const statusChangedUser = await User.findByIdAndUpdate(
      operatedUserId,
      { $set: { isBanned: userStatus === 'blocked' ? true : false } },
      { new: true }
    );

    sendEmail({ emailGenerator: bannedOrDeletedEmail, userEmail: statusChangedUser.email, subjectOption: `You was ${userStatus}!`,
      username: statusChangedUser.username, userOrList: 'you', bannedOrDeleted: userStatus });

    return res.status(200).json({ message: `User is successfuly ${userStatus}!`});
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const roleChange = async (req, res) => {
  try {
    if (req.userData.operatedUserBanStatus) return res.status(200).json( { message: 'You can not give moderator rights to blocked user!'});

    const { operatingUserRole, operatedUserRole } = req.userData;

    if (!(operatingUserRole === 'admin' && operatedUserRole !== 'admin')) return res.status(403).json({ message: 'Access denied!'});

    const { id: operatedUserId } =  req.params;
    const { userRole = 'user' } = req.query;

    await User.findByIdAndUpdate(
      operatedUserId,
      { $set: { role: userRole === 'user' ? userRole : 'moderator' } }
    );

    return res.status(200).json('Moderator rights was given!');

  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const getUsers = async (req, res) => {
  try {
    if (req.params.id) return res.status(200).json(await User.findById(req.params.id).select('-password'));

    let { searchQuery = 'username', search = '', page = 1, perPage = 5, sortQuery = 'username' } = req.query;
    let order = 1;

    if (sortQuery[0] === '-' ) {
      order = -1;
      sortQuery = sortQuery.slice(1);
    }

    const totalUsers = await User.count();

    if (perPage > totalUsers) {
      perPage = totalUsers;
      page = 1;
    }

    const totalPages = Math.ceil(totalUsers / perPage);

    if (page > totalPages) {
      page = totalPages;
    }

    const usersPerPage = await User.find(
      { [searchQuery]: { $regex: `${search}`, $options: 'i' } }
    ).collation({ locale: 'en'}).select('-password').sort({ [sortQuery]: order }).skip(Number(perPage) * ( page - 1 )).limit(Number(perPage));

    return res.status(200).json({ usersPerPage, totalPages });
        
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id: operatedUserId } = req.params;

    const deletedUser = await User.findByIdAndDelete(operatedUserId);

    sendEmail({ emailGenerator: bannedOrDeletedEmail, userEmail: deletedUser.email, subjectOption: 'You was deleted!',
      username: deletedUser.username, userOrList: 'you', bannedOrDeleted: 'deleted' });

    return res.status(200).json({ message: 'User successfuly deleted!'});
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

module.exports = { roleChange, deleteUser, statusChange, getUsers }
