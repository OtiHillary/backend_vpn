const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: '588057669834-i9aa7c62qqg7a7jqs5ugapf1lfoi883n.apps.googleusercontent.com', 
    clientSecret: process.env.SECRET,
    callbackURL: 'https://dashboard.techdispatch.us/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    // Process user profile info
    console.log('Google profile:', profile);
    try {
        // Check if user exists
        const result = await pool.query(
            'SELECT * FROM users WHERE google_id = $1',
            [profile.id]
        );

        if (result.rows.length > 0) {
            return done(null, result.rows[0]);
        }

        // If user does not exist, create a new one
        const newUser = await pool.query(
            'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *',
            [profile.id, profile.emails[0].value, profile.displayName]
        );

        return done(null, newUser.rows[0]);
    } catch (err) {
        done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
