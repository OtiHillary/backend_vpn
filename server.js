const express = require('express');
const cors = require('cors');
const { login, signup } = require('./auth')

const app = express();
const port = 3000;

app.use(cors());

app.get('/', (req, res) => {
   console.log('someone called /');
   res.send('Hello from the backend!');
});
app.post('/login-auth', CacheStorage, login);
app.post('/signup-auth', CacheStorage, signup);

app.listen(port, () => {
   console.log(`Server listening on port ${port}`);
});