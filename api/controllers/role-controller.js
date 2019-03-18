const userCheckList = require('../models/users-checklists');
const sendEmail = require('../controllers/send-email');
const { User } = require('../models/user-model');
const { Checklist } = require('../models/checklist-model');
const { bannedOrDeletedEmail } = require('./email-generator');

const banUser = async (req, res) => {
  try {
    const { operatedUserId } = req.body;

    const bannedUser = await User.findByIdAndUpdate(
      operatedUserId,
      { $set: { isBanned: true } },
      { runValidators: true, context: 'query', new: true }
    );

    sendEmail({ emailGenerator: bannedOrDeletedEmail, userEmail: bannedUser.email, subjectOption: 'Your was banned!',
      username: bannedUser.username, userOrList: 'you', bannedOrDeleted: 'banned' });

    return res.status(200).json({ message: 'User is successfuly banned!'});
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const unbanUser = async (req, res) => {
  try {
    const { operatedUserId } = req.body;

    const unbannedUser = await User.findByIdAndUpdate(
      operatedUserId,
      { $set: { isBanned: false } },
      { runValidators: true, context: 'query', new: true }
    );

    sendEmail({ emailGenerator: bannedOrDeletedEmail, userEmail: unbannedUser.email, subjectOption: 'Your was unbanned!',
      username: unbannedUser.username, userOrList: 'you', bannedOrDeleted: 'unbanned' });

    return res.status(200).json({ message: 'User is successfuly unbanned!'});
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const deleteUser = async (req, res) => {
  try {
    const { operatedUserId } = req.body;

    const deletedUser = await User.findByIdAndDelete(operatedUserId, { runValidators: true, context: 'query' });

    sendEmail({ emailGenerator: bannedOrDeletedEmail, userEmail: deletedUser.email, subjectOption: 'Your was deleted!',
      username: deletedUser.username, userOrList: 'you', bannedOrDeleted: 'deleted' });

    return res.status(200).json({ message: 'User successfuly deleted!'});
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const deleteCheckList = async (req, res) => {
  try {
    const { checkListId } = req.body;

    const deletedCheckList = await Checklist.findByIdAndDelete(checkListId, { runValidators: true, context: 'query' });
    const authorOfDeletedCheckList = await User.findById(deletedCheckList.author);
    
    await userCheckList.findOneAndDelete({ 'checklistID': checkListId });

    sendEmail({ emailGenerator: bannedOrDeletedEmail, userEmail: authorOfDeletedCheckList.email, subjectOption: 'Your checklist was deleted!',
      username: authorOfDeletedCheckList.username, userOrList: `checklist ${deletedCheckList.title}`, bannedOrDeleted: 'deleted' });

    return res.status(200).json({ message: 'Check list successfuly deleted!'});
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const giveModeratorRights = async (req, res) => {
  try {
    if (req.userData.operatedUserBanStatus) return res.status(200).json( { message: 'You can not give moderator rights to banned user!'});

    const { operatedUserId } =  req.body;

    await User.findByIdAndUpdate(
      operatedUserId,
      { $set: { role: 'moderator' } },
      { runValidators: true, context: 'query' }
    );

    return res.status(200).json('Moderator rights was given!');

  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const takeBackModeratorRights = async (req, res) => {
  try {
    if (req.userData.operatedUserBanStatus) return res.status(200).json( { message: 'You can not take back moderator rights to banned user!'});

    const { operatedUserId } =  req.body;

    await User.findByIdAndUpdate(
      operatedUserId,
      { $set: { role: 'user' } },
      { runValidators: true, context: 'query' }
    );

    return res.status(200).json('Moderator rights was given!');
        
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

module.exports = { banUser, unbanUser, deleteUser, deleteCheckList, giveModeratorRights, takeBackModeratorRights }
