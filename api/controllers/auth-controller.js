const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user-model');

const signUp = async (req, res) => {
    try {
        const { username, email, password, gender, location } = req.body; 
        if (!email || !password || !username) {
            return res.status(422).json({message: 'Please, fill up all fields'});
        }
    
        const userExist = await User.findOne({ email });
        if (userExist) return res.status(422).json({message: 'User with this email is already exist'});
    
        const hash = await bcrypt.hashSync(password, 10);
        const user = new User({
            username,
            email,
            password: hash,
            gender,
            location
        })
        const response = await user.save();
        res.status(201).json({message: 'User created', response});
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
        if (!user) return res.status(404).json({message: 'User with this email not found'});
    
        const match = await bcrypt.compareSync(password, user.password);
        if (match) {
            jwt.sign({email: user.email, id: user.id}, process.env.JWT_KEY, { expiresIn: '30d' }, (err, token) => {
                if (err) return res.sendStatus(500);
                res.status(200).json({message: 'user signed in', user: {
                    email: user.email, username: user.username, id: user.id, token
                }});
            });
        } else {
            res.status(401).json({message: 'Not Authorized'})
        }
    } catch(err) {
        res.status(500).json(err);
    }
}

module.exports = {signUp, signIn};