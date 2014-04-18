var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var config = require('../config');

passport.use(new FacebookStrategy({
    profileFields: ['id', 'displayName', 'photos', 'emails'],
    clientID: config.facebook_clientid,
    clientSecret: config.facebook_clientsecret,
    callbackURL: config.url + '/auth/callback'
}, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile, function(err, user) {
        done(null, user);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user._id);
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
