var mongoose = require('mongoose');
var uuid = require('node-uuid');
var dogeAPI = require('../libraries/dogeapi');
var doge = new dogeAPI();
var config = require('../config');

async = require("async");

var userSchema = new mongoose.Schema({
    fbId: {type: Number, unique: true},
    uuid: {type: String, unique: true},
    displayName: String,
    dogeAddress: {type: String, unique: true},
    email: String,
    balance: Number
});

userSchema.statics.findOrCreate = function (profile, callback) {
    var that = this;
    var userId = uuid.v4();
    userId = userId.replace(/-/gi, "");

    function create(dogeAddress) {
        //console.log(profile);
        var user = new that({
            fbId: profile.id,
            uuid: userId,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            dogeAddress: dogeAddress,
            balance: 1000
        });
        //console.log('New user:', user);
        user.save(function (err, user) {
            if (err) callback(err);
            callback(null, user);
            var sendgrid = require('sendgrid')(config.sendgridapi_user, config.sendgridapi_key);
            sendgrid.send({
                to: profile.emails[0].value,
                from: 'dogecache@gmail.com',
                subject: 'Welcome to Dogecache!',
                text: 'Welcome to the Dogecache community! We hope you enjoy dogecaching!'
            }, function (err, json) {
                if (err) {
                    return console.error(err);
                }
                console.log(json);
            });
        });
    }

    // try to check if user already exists
    that.findOne({fbId: profile.id}, function (err, result) {
        if (!err && result) {
            // user already exists
            callback(null, result);
        } else {
            // create a new user
            // generate new address
            doge.createUser(userId, function (error, res) {
                if (error) {
                    console.log(error);
                    // @TODO: Handle error
                }
                create(JSON.parse(res).data.address);
            });
        }
    });
};

userSchema.statics.bulkUpdateBalances = function (userBalArray, callback) {
    var that = this;
    async.each(userBalArray, function (elem, callback) {
        that.update({uuid: elem.userid}, {$inc: {balance: elem.inc}}, function(err, result){
            callback(err);
        });
    }, callback);
};

module.exports = mongoose.model('user', userSchema);