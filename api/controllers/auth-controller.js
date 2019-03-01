
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, validate } = require('../models/user-model');

const url = 'http://localhost:3000';

const signUp = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { username, email, password } = req.body;
        if (!email || !password || !username) {
            return res.status(422).json({ message: 'Please, fill up all fields.' });
        }

        let user = await User.findOne({ username });
        if (user) return res.status(422).json({ username: 'User with this username is already exist.' });

        user = await User.findOne({ email });
        if (user) return res.status(422).json({ email: 'User with this email is already exist.' });

        user = new User({ username, email, password });

        const salt = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hashSync(password, salt);
        await user.save();

        const token = user.generateAuthToken();
        res
            .header("access-token", token)
            .status(200).json({ message: 'User created', user: { email, username } })

    } catch (err) {
        res.status(500).json(err);
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({ message: 'email and password are required.' });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

        const validPassword = await bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });

        user.password = '';

        const token = user.generateAuthToken();
        res
            .header("access-token", token)
            .status(200).json({ user })
    } catch (err) {
        res.status(500).json(err);
    }
}

const validateUser = async (req, res) => {
    try {
        const token = req.headers['access-token'];
        if (!token) res.status(404).json({ message: 'Token not found' });

        const data = jwt.verify(token, process.env.JWT_KEY);

        const user = await User.findById(data.id).select("-password");
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
}

const socialAuth = async (req, res) => {
    try {
        const id = req.session.passport.user;
        const user = await User.findById(id);

        const token = user.generateAuthToken();

        return res.redirect(`${url}/redirect/?access-token=${token}`);
    } catch (err) {
        res.status(500).json(err);
    }
}

module.exports = { signUp, signIn, validateUser, socialAuth };
