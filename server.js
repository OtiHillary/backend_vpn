require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')

//db initialization
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {})
.then( () => console.log('MongoDB connected') )
.catch( err => console.error('MongoDB connection error:', err.message) );


const { login, signup } = require('./auth/auth');
const { fetchData } = require('./fetch-data/route');

const app = express();
const port = 3000;

async function cacher(req, res, next) {
   next()
}

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
   console.log('someone called /');
   res.send("Hello, I'm alive!");
});

app.post('/login-auth', cacher, login);
app.post('/signup-auth', cacher, signup);
app.post('/fetch-data', cacher, fetchData)

app.listen(port, () => {
   console.log(`Server listening on port ${port}`);
});