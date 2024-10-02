const User = require('../models/user');
const jwt = require('jsonwebtoken');


async function login (req, res) {
   const { email, password } = req.body;
   console.log('someone called login');
   console.log('someone called login with email:', email, ',password:', password);

   try {
      // Checking if user exists
      const user = await User.findOne({ email });
      if (!user) {
         return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Checking password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
         return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });

      res.json({ token });
   } catch (err) {
      console.error('the error is', err.message);
      res.status(500).json({ message: 'Server error' });
   }
}

async function signup (req, res) {
   const { email, password } = req.body;
   console.log('someone called signup with email:', email, ',password:', password);

   try {
      // Checking if user already exists
      let user = await User.findOne({ email });
      if (user) {
         return res.status(400).json({ message: 'User already exists' });
      } else {
         // Creating new user
         user = new User({
            email,
            password
         });
         await user.save();

         const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });         
         res.json({ token });
      }
   } catch (err) {
      console.error('the error is', err.message);
      res.status(500).json({ message: 'Server error' });
   }
}

function sessionHandler(req, res, next) {

   next()
}

module.exports = {
   login,
   signup,
   sessionHandler
}