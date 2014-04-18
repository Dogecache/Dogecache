var passport = require('passport') ,
    FacebookStrategy = require('passport-facebook').Strategy ,
    TwitterStrategy = require('passport-twitter').Strategy ,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy ,
    User = require('../models/user') ,
    config = require('../config');

passport.use(new FacebookStrategy({
    clientID: config.facebook_clientid,
    clientSecret: config.facebook_clientsecret,
    callbackURL: config.url + '/auth/callback'
}, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate('facebook', profile, function(err, user) {
        done(null, user);
    });
}));

passport.use(new TwitterStrategy({
    consumerKey: config.twitter_clientid,
    consumerSecret: config.twitter_clientsecret,
    callbackURL: (process.env.NODE_ENV == 'production') ? 'http://www.dogecache.com/auth/callback' : 'http://localhost:3000/auth/callback' //@TODO possibly move to config
}, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate('twitter', profile, function(err, user) {
        done(null, user);
    });
}));

passport.use(new GoogleStrategy({
    clientID: config.google_clientid,
    clientSecret: config.google_clientsecret,
    callbackURL: (process.env.NODE_ENV == 'production') ? 'http://www.dogecache.com/auth/callback' : 'http://localhost:3000/auth/callback' //@TODO possibly move to config
}, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate('twitter', profile, function(err, user) {
        done(null, user);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({_id: id}, function(err, user) {
        done(err, user);
    });
});

//export authentication methods for facebook
exports.login_facebook = passport.authenticate('facebook', {
    scope: "email",
    failureRedirect: '/'
});

exports.loginCallback_facebook = passport.authenticate('facebook', {
    successRedirect: '/map',
    failureRedirect: '/'
});

//export authentication methods for twitter
exports.login_twitter = passport.authenticate('twitter', {
    failureRedirect: '/'
});

exports.loginCallback_twitter = passport.authenticate('twitter', {
    successRedirect: '/map',
    failureRedirect: '/'
});

//export authentication methods for google
exports.login_google = passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ],
    failureRedirect: '/'
});

exports.loginCallback_google = passport.authenticate('google', {
    successRedirect: '/map',
    failureRedirect: '/'
});

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};
