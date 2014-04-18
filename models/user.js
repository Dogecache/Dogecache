var mongoose = require('mongoose');
var uuid = require('node-uuid');
var dogeAPI = require('../libraries/dogeapi');
var doge = new dogeAPI();
var config = require('../config');
var sendgrid = require('sendgrid')(config.sendgridapi_user, config.sendgridapi_key);

async = require("async");

// TODO: prevent duplication on fields without use of unique option
var userSchema = new mongoose.Schema({
    provider: String,                                   //login provider
    providerId: String,                                 //user's profile id
    displayName: String,                                //real display name
    dogeAddress: String,                                //doge deposit address
    email: String,                                      //user email
    balance: Number,                                    //user balance
    profilePhoto: String,                               //profile photo URL
    apiKey: String                                      //random API key
});


/**
 * determine whether a user exists; and if one does not, add a new entry and create a new address
 * @param profile       user profile data
 * @param callback      callback function
 */
userSchema.statics.findOrCreate = function (profile, callback) {
    var that = this;

    // try to check if user already exists
    that.findOne({$or: [
        {provider: {$exists: false}, fbId: profile.id},
        {provider: {$exists: true}, providerId: profile.id}
    ]}, function (err, result) {
        if (!err && result) {
            // user already exists

            // if still on old schema, migrate relevant fields
            // TODO: db migration fbId->providerId and other relevant fields
            if (!result.provider) {
                result.provider = 'facebook';
                result.profilePhoto = "https://graph.facebook.com/" + result.fbId + "/picture?width=90&height=90";
                result.providerId = result.fbId;
            }

            callback(null, result);
        } else {
            async.waterfall([
                function(done) {
                    // create new user in database
                    var user = new that({
                        provider: profile.provider,
                        providerId: profile.id,
                        displayName: profile.displayName,
                        email: (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null,
                        profilePhoto: (profile.photos && profile.photos.length > 0) ? profile.photos[0].value : null,
                        balance: 0,
                        apiKey: uuid.v4()
                    });
                    //console.log('New user:', user);
                    //save the user
                    user.save(function(err) {
                        done(err, user);
                    });
                },
                function(user, done) {
                    async.parallel([
                        function(done) {
                            //send the new user an email
                            if (!profile.email) return done();
                            sendgrid.send({
                                to: profile.emails[0].value,
                                from: 'dogecache@gmail.com',
                                subject: 'Welcome to Dogecache!',
                                text: 'Welcome to the Dogecache community! We hope you enjoy dogecaching!'
                            }, done);
                        },
                        function(done) {
                            // generate new address
                            async.waterfall([
                                function(done) {
                                    // create user
                                    doge.createUser(user._id.toString(), done);
                                },
                                function(res, done) {
                                    // save dogecoin address
                                    user.update({dogeAddress: JSON.parse(res).data.address}, done);
                                }
                            ], done);
                        }
                    ], function(err) {
                        done(err, user);
                    });
                }
            ], callback);
        }
    });
};

/**
 * @todo consider two factor commits instead
 * bulk update balances of users in userBalArray
 * @param userBalArray          array of {_id: _id, inc: inc}
 * @param callback              callback function
 */
userSchema.statics.bulkUpdateBalances = function (userBalArray, callback) {
    var that = this;
    async.each(userBalArray, function (elem, callback) {
        if (typeof elem !== "undefined") {
            that.update({_id: elem._id}, {$inc: {balance: elem.inc}}, function (err, result) {
                callback(err);
            });
        }
    }, callback);
};

module.exports = mongoose.model('user', userSchema);