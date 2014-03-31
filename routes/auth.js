var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var config = require('../config');

passport.use(new FacebookStrategy({
    clientID: config.facebook_clientid,
    clientSecret: config.facebook_clientsecret,
    callbackURL: (process.env.NODE_ENV == 'production') ? 'http://dogecache.com/auth/callback' : 'http://localhost:3000/auth/callback' //@TODO possibly move to config
}, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile, function(err, user) {
        done(null, user);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.fbId);
});

passport.deserializeUser(function(id, done) {
    User.findOne({fbId: id}, function(err, user) {
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
