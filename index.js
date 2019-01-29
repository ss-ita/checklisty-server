const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const apiRouter = require('./api/routes/api-routes');

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', apiRouter);

mongoose.connect(`mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_HOST}`, {useNewUrlParser: true})
 .then(() => {
    console.log('Connected to mongodb'); //eslint-disable-line
})

app.listen(port, () => console.log('Server is running on port ' + port)); //eslint-disable-line
