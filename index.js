const express = require('express');
const mongoose = require('mongoose');

mongoose.connect(`mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_HOST}`, {useNewUrlParser: true})
 .then(() => {
    console.log('Connected to mongodb'); //eslint-disable-line
})

const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.json('App get works'));
app.listen(port, () => console.log('Server is running on port ' + port)); //eslint-disable-line

