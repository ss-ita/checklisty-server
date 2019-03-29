const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, validate } = require('../models/user-model');

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

const signUp = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { firstname, lastname, username, email, password } = req.body;
    if (!email || !password || !username || !firstname || !lastname) {
      return res.status(422).json({ message: 'Please, fill up all fields!' });
    }

    let user = await User.findOne({ username });
    if (user)
      return res
        .status(422)
        .json({ message: 'User with this username is already exist!' });

    user = await User.findOne({ email });
    if (user)
      return res
        .status(422)
        .json({ message: 'User with this email is already exist!' });

    user = new User({ firstname, lastname, username, email, password });

    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hashSync(password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res
      .header('access-token', token)
      .status(200)
      .json({
        message: 'User created!',
        user: { firstname, lastname, email, username }
      });
  } catch (err) {
    res.status(500).json(err);
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(422)
        .json({ message: 'Email and password are required!' });
    }
    const user = await User.findOne({ email }).populate('team', 'name');
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password!' });

    const validPassword = await bcrypt.compareSync(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: 'Invalid email or password!' });

    if (user.isBlocked)
      return res
        .status(403)
        .json({ message: 'You can not login because you are blocked!' });

    user.password = '';

    const token = user.generateAuthToken();
    res
      .header('access-token', token)
      .status(200)
      .json({ user });
  } catch (err) {
    res.status(500).json(err);
  }
};

const validateUser = async (req, res) => {
  try {
    const token = req.headers['access-token'];
    if (!token) return res.status(404).json({ message: 'Token not found!' });
    const data = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findById(data.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

const socialAuth = async (req, res) => {
  try {
    const id = req.session.passport.user;
    const user = await User.findById(id);
    if (user.isBlocked) return res.redirect(`${baseURL}/blocked`);

    const token = user.generateAuthToken();

    return res.redirect(`${baseURL}/redirect/?access-token=${token}`);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = { signUp, signIn, validateUser, socialAuth };
