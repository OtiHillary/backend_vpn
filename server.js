const express = require('express');
const cors = require('cors');
const { login, signup } = require('./auth/auth')

const app = express();
const port = 3000;

async function cacher(req, res, next) {
   next()
}

app.use(cors());

app.get('/', (req, res) => {
   console.log('someone called /');
   res.send("Hello, I'm alive!");
});
app.get('/login-auth', cacher, login);

app.post('/login-auth', cacher, login);
app.post('/signup-auth', cacher, signup);

app.listen(port, () => {
   console.log(`Server listening on port ${port}`);
});