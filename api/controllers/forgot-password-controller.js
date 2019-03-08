const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user-model');
const emailGenerate = require('./email-generator')

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(422).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User with this email doesn\'t exists.' });
    if (!user.password) return res.status(400).json({ message: 'This user has no password. Try to sign in with social which you have used for registration' })

    const token = user.generateAuthToken('10m');

    const resetPasswordURL = `${baseURL}/auth/reset-password/?recovery-token=${token}`;

    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
      }
    });

    const mailOptions = {
      to: email,
      from: 'lv379nodejs@gmail.com',
      subject: 'Password reset for Checklisty',
      html: emailGenerate(user.username, resetPasswordURL)
    };

    await smtpTransport.sendMail(mailOptions, () => {
      return res.status(200).send('Email has been sent with further instructions');
    });

  } catch (err) {
    res.status(500).json(err);
  }
}

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (!password || !confirmPassword) return res.status(422).json({ message: 'Password and confirm password are required.' });
    if (password !== confirmPassword) return res.status(422).json({ message: 'Passwords don\'t match.' });

    const userId = jwt.verify(token, process.env.JWT_KEY).id;

    const user = await User.findById(userId);

    if (!user.password) return res.status(400).json({ message: 'This user has no password. Try to sign in with social which you have used for registration.' })

    const salt = bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(password, salt);

    await User.findByIdAndUpdate(userId, { $set: { password: newPassword } });
    res.status(200).json({ message: 'Password changed!' });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(503).json({ message: 'Tokens time expired' })
    } else {
      return res.status(500).json(err);
    }
  }
}

module.exports = { forgotPassword, resetPassword };