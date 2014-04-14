var mongoose = require('mongoose');
var uuid = require('node-uuid');
var dogeAPI = require('../libraries/dogeapi');
var doge = new dogeAPI();
var config = require('../config');

async = require("async");

var userSchema = new mongoose.Schema({
    fbId: {type: Number, unique: true, dropDups: true},                 //user's facebook id
    uuid: {type: String, unique: true, dropDups: true},                 //unique identifier id
    displayName: String,                                //real display name
    dogeAddress: {type: String, unique: true},          //doge deposit address
    email: String,                                      //user email
    balance: Number                                     //user balance
});


/**
 * determine whether a user exists; and if one does not, add a new entry and create a new address
 * @param profile       user profile data
 * @param callback      callback function
 */
userSchema.statics.findOrCreate = function (profile, callback) {
    var that = this;
    var userId = uuid.v4();
    profile.userId = userId.replace(/-/gi, "");

    // try to check if user already exists
    that.findOne({fbId: profile.id}, function (err, result) {
        if (!err && result) {
            // user already exists
            callback(null, result);
        } else {
            // generate new address
            doge.createUser(profile.userId, function (error, res) {
                if (error) {
                    console.log(error);
                    callback(err);
                    // @TODO: Handle error
                }
                else {
                    //console.log(profile);
                    // create a new user
                    var user = new that({
                        fbId: profile.id,
                        uuid: profile.userId,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        dogeAddress: JSON.parse(res).data.address,
                        balance: 0
                    });
                    //console.log('New user:', user);
                    //save the user
                    user.save(function (err, user) {
                        if (err) callback(err);
                        callback(null, user);
                        //send the new user an email
                        var sendgrid = require('sendgrid')(config.sendgridapi_user, config.sendgridapi_key);
                        sendgrid.send({
                            to: profile.emails[0].value,
                            from: 'dogecache@gmail.com',
                            subject: 'Welcome to Dogecache!',
                            text: 'Welcome to the Dogecache community! We hope you enjoy dogecaching!'
                        }, function (err, json) {
                            if (err) {
                                console.log(err);
                            }
                            //console.log(json);
                        });
                    });
                }
            });
        }
    });
};

/**
 * @todo consider two factor commits instead
 * bulk update balances of users in userBalArray
 * @param userBalArray          array of uuids
 * @param callback              callback function
 */
userSchema.statics.bulkUpdateBalances = function (userBalArray, callback) {
    var that = this;
    async.each(userBalArray, function (elem, callback) {
        if (typeof elem !== "undefined") {
            that.update({uuid: elem.userid}, {$inc: {balance: elem.inc}}, function (err, result) {
                callback(err);
            });
        }
    }, callback);
};

module.exports = mongoose.model('user', userSchema);