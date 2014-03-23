var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');

passport.use(new FacebookStrategy({
    clientID: 1496318680595746,
    clientSecret: '3d32fd6636a759505f7252b54019cdf1',
    callbackURL: 'http://localhost:3000/auth/callback'
}, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile, function(err, user) {
        done(null, user);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

exports.login = passport.authenticate('facebook', {scope: "email"});

exports.loginCallback = passport.authenticate('facebook', {
    successRedirect: '/map',
    failureRedirect: '/'
});

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};
