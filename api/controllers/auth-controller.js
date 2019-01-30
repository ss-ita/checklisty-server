/* eslint-disable node/no-unsupported-features/es-syntax */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user-model');

const signUp = async (req, res) => {
    try {
        if (!req.body.email || req.body.password || !req.body.fullName) {
            return res.status(422).json({message: 'Please, fill up all fields'});
        }
    
        const userExist = await User.findOne({ email: req.body.email });
        if (userExist) return res.status(422).json({message: 'User with this email is already exist'});
    
        const hash = await bcrypt.hashSync(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            fullName: req.body.fullName,
            password: hash,
        })
        const response = await user.save();
        res.status(201).json({message: 'User created', response});
    } catch (err) {
        res.status(500).json(err);
    }   
};

const signIn = async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(422).json({message: 'email and password are required'});
        }
        
        const user = await User.findOne({email: req.body.email});
        if (!user) return res.status(404).json({message: 'User with this email not found'});
    
        const match = await bcrypt.compareSync(req.body.password, user.password);
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