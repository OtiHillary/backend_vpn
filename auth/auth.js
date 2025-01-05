const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const axios = require('axios');

//db initialization
const pool = new Pool({
   user: 'testuser',
   host: '135.148.24.65',
   database: 'testdb',
   password: 'otonye',
   port: 5432,   
});

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: 'otiedwin40@gmail.com',
     pass: 'ltnpxfsydtwurjjq'
   }
});
 

//helper function

function generatePassword() {
   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let password = '';
 
   for (let i = 0; i < 8; i++) {
     const randomIndex = Math.floor(Math.random() * characters.length);
     password += characters[randomIndex];
   }
 
   return password;
}

function sendmail(password, email) {
   const mailOptions = {
      from: 'TechDispatch otiedwin40@gmail.com',
      to: `Receiver Name ${ email }`,
      subject: 'Password Reset',
      text: `Good day,\n your password has been reset. Your new password is:\n ${password}`
   };

   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
   });
}


function sendVerificationMail(link, email) {
   const mailOptions = {
      from: 'TechDispatch otiedwin40@gmail.com',
      to: `Receiver Name ${ email }`,
      subject: 'Verify your account',
      html: `
    <div>
        <h2 style="text-align: center; padding: 1rem; border-radius: 4px; font-family: Arial, Helvetica, sans-serif; color: white; background-color:rgb(85, 9, 139);">
            Techdispatch
        </h2>
        <p>Good day,</p>
        <p>Welcome to our platform! We’re excited to have you on board. To ensure the security of your account, please verify your email address by clicking the link below.</p>
        <div style="display:flex; justify-content: center; width: 100%;">
            <a href= "${ link }" style="
                  display: inline-block;
                  background-color: #6a0dad; /* Purple background */
                  color: #ffffff; /* White text */
                  padding: 10px 20px; /* Padding for size */
                  text-decoration: none; /* Remove underline */
                  border-radius: 4px; /* Slightly rounded corners */
                  font-family: Arial, sans-serif; 
                  font-weight: bold; 
                  font-size: 16px; 
                  margin:auto;
                  text-align: center;
                  transition: background-color 0.3s ease;"
               onmouseover="this.style.backgroundColor='#5a0ca3'" 
               onmouseout="this.style.backgroundColor='#6a0dad'"
            >
               Verify Account here
            </a>      
        </div> 
         <p style="margin-top: 3rem;">Best Regards, <br> The Team</p>
         <hr style="opacity: .1;">
         <p style="font-size: x-small; font-weight: bold; font-style: italic; font-weight: 100; color: red;">Note: We would not ask you for your password. beware of scammers</p>
    </div>
         `
   };

   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
   });
}

//helper function END


async function login (req, res) {
   try {
      const { email, password } = req.body;
      console.log('someone called login with email:', email, ',password:', password);
   
      // Checking if user exists
      const queryResult = await pool.query('SELECT * FROM vpn_user WHERE email = $1', [email]);
      const user = queryResult.rows[0];
      console.log(user)
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      if (!user.verified) {
         return res.status(401).json({ message: 'User not verified, check email for verification link' });
      }

      // Checking password hash
      const isMatch = password == user.password_hash;
      if (!isMatch) {
         return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.email, verified: user.verified }, 'secretkey', { expiresIn: '1h' });
      res.status(200).json({ token });

   } catch (err) {
      console.error('the error is', err.message);
      res.status(500).json({ message: 'Server error' });
   }
}

async function signup (req, res) {
   try {
      const { email, password } = req.body;
      console.log('someone called signup with email:', email, ',password:', password);

      // Checking if user already exists
      let queryResult = await pool.query('SELECT * FROM vpn_user WHERE email = $1', [email])
      let user = queryResult.rows[0]
      
      if (user) {
         return res.status(400).json({ message: 'User already exists' });
      } else {
         // Creating new user
         await pool.query(`INSERT INTO vpn_user (email, password_hash, vpn_name, verified)\nVALUES ($1, $2, '', $3)`, [email, password, false])
         console.log('success');

         const token = jwt.sign({ id: email }, 'secretkey', { expiresIn: '1h' });         
         sendVerificationMail(`https://dashboard.techdispatch.us/verify?token=${token}`, email)
         res.status(200).json({ message: "successful" });
      }
   } catch (err) {
      console.error('the error is', err.message);
      res.status(500).json({ message: err.message });
   }
}

async function resetPassword (req, res) {
   try {
      const { email } = req.body;
      console.log(req.body);
      
      let queryResult = await pool.query('SELECT * FROM vpn_user WHERE email = $1', [email])
      let user = queryResult.rows[0]
      let newPasswordHash = generatePassword()

      if (!user) {
         return res.status(400).json({ message: 'No such user exists' });
      }

      await pool.query('UPDATE vpn_user SET password_hash = $2 WHERE email = $1', [email, newPasswordHash]);
      console.log('success');
      sendmail(newPasswordHash, email)
      res.status(200).json({ message: "success" });

   } catch (error) {
      console.error('the error is', error.message);
      res.status(500).json({ message: error.message });
   }
}

async function verifyUser (req, res) {
   try {
      const {token} = req.body
      const email = jwt.verify(token, 'secretkey');
      console.log(`jwt token decoded is: ${email.id}`)

      await pool.query('UPDATE vpn_user\n SET verified = TRUE\n WHERE email = $1', [email.id]);
      res.status(200).json({ message: "success" });

   } catch (error) {
      res.status(500).json({ message: error })
   }
}

async function mailFromAdmin (req, res) {
   try {
      const {email} = req.body
      const token = jwt.sign({ id: email }, 'secretkey', { expiresIn: '1h' });         
      sendVerificationMail(`https://dashboard.techdispatch.us/verify?token=${token}`, email)
      res.status(200);

   } catch (error) {
      res.status(500)      
   }
}

async function googleOAuthCallback(req, res) {
   const code = req.query.code; // Authorization code from Google
   const clientId = process.env.CLIENT;
   const clientSecret = process.env.SECRET;
   const redirectUri = 'https://dashboard.techdispatch.us/api/auth/google/callback';

   try {
      // Exchange authorization code for access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
         code,
         client_id: clientId,
         client_secret: clientSecret,
         redirect_uri: redirectUri,
         grant_type: 'authorization_code',
      });

      const { access_token } = tokenResponse.data;

      // Fetch user info from Google using access token
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
         headers: { Authorization: `Bearer ${access_token}` },
      });

      const userInfo = userInfoResponse.data;
      console.log('User Info:', userInfo);

      // Extract googleId, email, and other details
      const googleId = userInfo.sub;
      const email = userInfo.email;
      // const name = userInfo.name;

      // Check if user exists in your database
      const queryResult = await pool.query('SELECT * FROM vpn_user WHERE email = $1', [email]);
      let user = queryResult.rows[0];

      if (!user) {
         // If user doesn't exist, create a new user
         user = await pool.query(
               'INSERT INTO vpn_user (email, password_hash, vpn_name, verified, google_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
               [email, '', '', true, googleId]
         );
      }

      // Generate a JWT for the user
      const token = jwt.sign({ id: user.email, verified: user.verified }, 'secretkey', { expiresIn: '1h' });

      // Redirect or respond with the token
      res.redirect(`https://dashboard.techdispatch.us/login?token=${token}`);

   } catch (error) {
      console.error('Error during Google OAuth:', error.response?.data || error.message);
      res.status(500).json({ message: 'Authentication failed' });
   }
}

function sessionHandler(req, res, next) {
   next()
}

module.exports = {
   login,
   signup,
   resetPassword,
   verifyUser,
   mailFromAdmin,
   googleOAuthCallback,
   sessionHandler
}