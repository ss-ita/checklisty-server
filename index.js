/* eslint-disable no-unused-vars */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./api/routes/api-routes');
const passportSetup = require('./passport/passport-setup');
const passport = require('passport');

mongoose.connect(`mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_HOST}`, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to mongodb'); //eslint-disable-line
    })

const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "access-token");
    res.header("Access-Control-Expose-Headers", "access-token");
    next();
});

const port = process.env.PORT || 3030;

app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({ limit: '50mb' }));

app.use(bodyParser.text({ type: 'text/plain', limit: '50mb' }));

app.use('/api', apiRouter);

app.get('/', (req, res) => res.json('App get works'));
app.listen(port, () => console.log('Server is running on port ' + port)); //eslint-disable-line

