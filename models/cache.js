var mongoose = require('mongoose');
var User = require('./user');
var async = require('async');

const WAGER_FEE = 1; //wager fee deducted at time of wager, in percent

var cacheSchema = new mongoose.Schema({
    fbId: Number,
    amount: Number,
    loc: {
        index: '2dsphere',
        type: [Number]
    }
});

cacheSchema.statics.addCache = function (user, amount, longitude, latitude, callback) {
    var that = this;

    // check that the user has enough money left
    if (user.balance < amount) return callback("Not enough money remaining");

    // Subtract the amount from the balance
    User.update({fbId: user.fbId}, {$inc: {balance: -amount}}, function (err) {
        if (err) {
            console.log(err);
            return callback(err);
        }

        amount = amount*(1-WAGER_FEE*0.01);

        // Create the cache
        var cache = new that({
            fbId: user.fbId,
            amount: amount,
            loc: [longitude, latitude]
        });

        cache.save(function (err) {
            callback(err, cache);
        });
    });
};

cacheSchema.statics.findCaches = function (user, maxDistance, longitude, latitude, callback) {
    var that = this;
    that.find({
        fbId: {
            $ne: user.fbId
        },
        loc: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance
            }
        }
    }, function (err, results) {
        callback(err, results);
    });
};

cacheSchema.statics.gatherCaches = function (user, caches, callback) {
    // total up the amount of doge received
    var total = 0;
    if (Array.isArray(caches)) {
        for (var i = 0; i < caches.length; i++) {
            total += caches[i].amount;
        }


        async.parallel([
            // remove the caches
            function (done) {
                async.each(caches, function (cache, done) {
                    cache.remove(done)
                }, done);
            },
            // add balance to user
            function (done) {
                User.update({fbId: user.fbId}, {$inc: {balance: total}}, done);
            }
        ], function (err) {
            callback(err, total);
        });
    }
};

module.exports = mongoose.model('cache', cacheSchema);