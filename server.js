require('dotenv').config();
const https = require('https')
const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
// const session = require('express-session');
// const passport = require('passport');

// Loading SSL certificate and key
const options = {
   key: fs.readFileSync('/home/adm_cloud_01/ssl/localhost.key'), 
   cert: fs.readFileSync('/home/adm_cloud_01/ssl/localhost.crt')
 };

//db initialization
const pool = new Pool({
   user: 'testuser',
   host: '135.148.24.65',
   database: 'testdb',
   password: 'otonye',
   port: 5432,   
});

pool.connect()
.then(() => {
   console.log('Connected to PostgreSQL');
})
.catch(err => {
   console.error('Could not connect to PostgreSQL', err);
});

const { login, signup, resetPassword, verifyUser, mailFromAdmin, googleOAuthCallback} = require('./auth/auth');
const { fetchData, downloadConf } = require('./fetch-data/route');

const app = express();
const port = 3000;

async function cacher(req, res, next) {
   next()
}

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*'); // Allows requests from any origin
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');   
   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');   
   next();
});

// app.use(passport.initialize());
// passport.use(new JwtStrategy(options, verifyFunction));


app.get('/', (req, res) => {
   console.log('someone called home');
   res.send("Hello, I'm alive!");
});

app.post('/login-auth', cacher, login);
app.post('/signup-auth', cacher, signup);
app.post('/fetch-data', cacher, fetchData)
app.post('/reset', cacher, resetPassword)
app.post('/verify', cacher, verifyUser)
app.get('/download-conf', cacher,  downloadConf)
app.get('/auth/google/callback', googleOAuthCallback);
 
//admin
app.post('/admin-mail', cacher, mailFromAdmin)


// Start the server over HTTPS
https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS Express server is running at https://135.148.24.68:${port}`);
});