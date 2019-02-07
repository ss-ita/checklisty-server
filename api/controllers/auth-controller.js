const bcrypt = require('bcryptjs');
const User = require('../models/user-model');

const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body; 
        if (!email || !password || !username) {
            return res.status(422).send('Please, fill up all fields');
        }
        
        let user = await User.findOne({ email });
        if (user) return res.status(422).send('User with this email is already exist');

        user = new User({ username, email, password })
        const salt = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hashSync(password, salt);
        await user.save();

        const token = user.generateAuthToken();
        res
            .header("access-token", token)
            .status(200).json({message: 'User created', user: {email, username}})

    } catch (err) {
        res.status(500).json(err);
    }   
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body; 
        if (!email || !password) {
            return res.status(422).json({message: 'email and password are required'});
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Invalid email or password.');

        const validPassword = await bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(400).send('Invalid email or password.');

        const token = user.generateAuthToken();
        res.status(200).send(token);
    } catch(err) {
        res.status(500).json(err);
    }
}

module.exports = {signUp, signIn};