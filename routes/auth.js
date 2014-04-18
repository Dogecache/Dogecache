var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var config = require('../config');

if (config.facebook_clientid && config.facebook_clientsecret || process.env.NODE_ENV == 'PRODUCTION') {
    passport.use(new FacebookStrategy({
        profileFields: ['id', 'displayName', 'photos', 'emails'],
        clientID: config.facebook_clientid,
        clientSecret: config.facebook_clientsecret,
        callbackURL: config.url + '/auth/callback/facebook'
    }, function (accessToken, refreshToken, profile, done) {
        User.findOrCreate(profile, done);
    }));
} else {
    console.log('Facebook login provider not configured');
}

if (config.twitter_clientid && config.twitter_clientsecret || process.env.NODE_ENV == 'PRODUCTION') {
    passport.use(new TwitterStrategy({
        profileFields: ['id', 'displayName', 'photos', 'emails'],
        consumerKey: config.twitter_clientid,
        consumerSecret: config.twitter_clientsecret,
        callbackURL: config.url + '/auth/callback/twitter'
    }, function(accessToken, refreshToken, profile, done) {
        User.findOrCreate(profile, function(err, user) {
            done(err, user);
        });
    }));
} else {
    console.log('Twitter login provider not configured');
}

if (config.google_clientid && config.google_clientsecret || process.env.NODE_ENV == 'PRODUCTION') {
    passport.use(new GoogleStrategy({
        profileFields: ['id', 'displayName', 'photos', 'emails'],
        clientId: config.google_clientid,
        clientSecret: config.google_clientsecret,
        callbackURL: config.url + '/auth/callback/google'
    }, function(accessToken, refreshToken, profile, done) {
        User.findOrCreate(profile, function(err, user) {
            done(null, user);
        });
    }));
} else {
    console.log('Google login provider not configured');
}

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

exports.login = function(req, res) {
    return passport.authenticate(req.params.provider, {scope: "email"})(req, res);
};

exports.loginCallback = function(req, res) {
    return passport.authenticate(req.params.provider, {
        successRedirect: '/map',
        failureRedirect: '/'
    })(req, res);
};

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};
