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
    dogeAddress: String,
    email: String,
    balance: Number
});

userSchema.statics.findOrCreate = function (profile, callback) {
    var that = this;

    function create(dogeAddress) {
        console.log(profile);
        var user = new that({
            fbId: profile.id,
            uuid: uuid.v4(),
            displayName: profile.displayName,
            email: profile.emails[0].value,
            dogeAddress: dogeAddress,
            balance: 1000
        });
        console.log('New user:', user);
        user.save(function (err, user) {
            if (err) callback(err);
            callback(null, user);
            var sendgrid  = require('sendgrid')(config.sendgridapi_user, config.sendgridapi_key);
            sendgrid.send({
                to:       profile.emails[0].value,
                from:     'dogecache@gmail.com',
                subject:  'Welcome to Dogecache!',
                text:     'Welcome to the Dogecache community! We hope you enjoy dogecaching!'
            }, function(err, json) {
                if (err) { return console.error(err); }
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

            // check if dogeaddress already exists
            doge.getUserAddress(profile.id, function (err, res) {
                if (!err) {
                    create(JSON.parse(res).data.address);
                } else {
                    // generate new address
                    doge.createUser(profile.id, function (error, res) {
                        if (error) {
                            console.log(error);
                            // @TODO: Handle error
                        }
                        create(JSON.parse(res).data.address);
                    });
                }
            });
        }
    })
};

userSchema.statics.bulkUpdateBalances = function (userBalArray, callback) {
    var that = this;
    async.each(userBalArray, function (elem, callback) {
        that.update({fbId: elem.userid}, {$inc: {balance: elem.inc}});
        callback();
    }, callback);
};

module.exports = mongoose.model('user', userSchema);