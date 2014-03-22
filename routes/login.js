var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');

passport.use(new FacebookStrategy({
    clientID: 1496318680595746,
    clientSecret: '3d32fd6636a759505f7252b54019cdf1',
    callbackURL: 'http://localhost:3000/login/callback'
}, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile, function(err, user) {
        done(user);
    });
}));

exports.login = function(req, res) {
    passport.authenticate('facebook');
};

exports.loginCallback = function(req, res) {
    passport.authenticate('facebook', {
        successRedirect: '/map',
        failureRedirect: '/'
    });
};
