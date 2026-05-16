const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');
const env = require('./env');

passport.use(new GoogleStrategy({
    clientID: env.google.clientId,
    clientSecret: env.google.clientSecret,
    callbackURL: env.google.callbackUrl
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findByEmail(profile.emails[0].value);
        
        if (!user) {
            // Create user if not exists
            user = await User.create({
                username: profile.displayName,
                email: profile.emails[0].value,
                passwordHash: 'OAUTH_USER', // Placeholder for OAuth users
                role: 'USER'
            });
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
