var mongoose = require('mongoose');

var dogeAPI = require('../libraries/dogeapi');
var doge = new dogeAPI();

async = require("async");

var userSchema = new mongoose.Schema({
    fbId: {type: Number, unique: true},
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
            displayName: profile.displayName,
            email: profile.emails[0].value,
            dogeAddress: dogeAddress,
            balance: 0
        });
        console.log('New user:', user);
        user.save(function (err, user) {
            if (err) callback(err);
            callback(null, user);
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