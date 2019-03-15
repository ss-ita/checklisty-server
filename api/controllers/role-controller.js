const nodemailer = require('nodemailer');
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

    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
      }
    });
      
    const mailOptions = {
      to: bannedUser.email,
      from: 'lv379nodejs@gmail.com',
      subject: 'User was banned!',
      html: bannedOrDeletedEmail(bannedUser.username, 'you', 'banned')
    };
      
    smtpTransport.sendMail(mailOptions);

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

    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
      }
    });
        
    const mailOptions = {
      to: unbannedUser.email,
      from: 'lv379nodejs@gmail.com',
      subject: 'User was unbanned!',
      html: bannedOrDeletedEmail(unbannedUser.username, 'you', `unbanned by administration`)
    };
        
    smtpTransport.sendMail(mailOptions);

    return res.status(200).json({ message: 'User is successfuly unbanned!'});
  } catch (err) {
    return res.status(500).json(err.message);
  }
}

const deleteUser = async (req, res) => {
  try {
    const { operatedUserId } = req.body;

    const deletedUser = await User.findByIdAndDelete(operatedUserId, { runValidators: true, context: 'query' });

    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
      }
    });
        
    const mailOptions = {
      to: deletedUser.email,
      from: 'lv379nodejs@gmail.com',
      subject: 'User was deleted!',
      html: bannedOrDeletedEmail(deletedUser.username, 'You', `deleted by administration`)
    };
        
    smtpTransport.sendMail(mailOptions);

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

    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
      }
    });

    const mailOptions = {
      to: authorOfDeletedCheckList.email,
      from: 'lv379nodejs@gmail.com',
      subject: 'CheckList was deleted!',
      html: bannedOrDeletedEmail(authorOfDeletedCheckList.username, `checklist ${deletedCheckList.title}`, `deleted by administration`)
    };
        
    smtpTransport.sendMail(mailOptions);

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
