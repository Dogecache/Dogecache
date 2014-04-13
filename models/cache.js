var mongoose = require('mongoose');
var User = require('./user');
var async = require('async');

const WAGER_FEE = 1; //wager fee deducted at time of wager, in percent

var cacheSchema = new mongoose.Schema({
    uuid: String,                           //uuid of user who dropped the cache
    amount: Number,                         //cache value (post fee deduction)
    loc: {                                  //location of the cache [longitude, latitude]
        index: '2dsphere',
        type: [Number]
    }
});

/**
 * Add a new cache to the collection
 * @param user                  user object
 * @param amount                cache value  (pre fee deduction)
 * @param longitude             longitude of the cache
 * @param latitude              latitude of the cache
 * @param callback              callback function
 * @returns {*}
 */
cacheSchema.statics.addCache = function (user, amount, longitude, latitude, callback) {
    var that = this;

    // check that the user has enough money left
    if (user.balance < amount) return callback("Not enough money remaining");

    // Subtract the amount from the balance
    User.update({uuid: user.uuid}, {$inc: {balance: -amount}}, function (err) {
        if (err) { //@todo let two phase commit handle balance modifications
            console.log(err);
            return callback(err, null);
        }

        //adjust the amount for the wager fee
        amount = amount*(1-WAGER_FEE*0.01);

        // Create the cache
        var cache = new that({
            uuid: user.uuid,
            amount: amount,
            loc: [longitude, latitude]
        });

        cache.save(function (err) {
            if (err) {
                return callback(err, null);
            }
            return callback(err, cache);
        });
    });
};

/**
 * find all caches within maxDistance that do not equal user.uuid
 * @param user                      user object
 * @param maxDistance               max search distance (radius)
 * @param longitude                 longitude of cache
 * @param latitude                  latitude of cache
 * @param callback                  callback function
 */
cacheSchema.statics.findCaches = function (user, maxDistance, longitude, latitude, callback) {
    var that = this;
    that.find({
        uuid: {
            $ne: user.uuid
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


/**
 * gather all caches in caches array, deleting them and crediting the user
 * @param user              user object
 * @param caches            array of caches
 * @param callback          callback function
 */
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
                User.update({uuid: user.uuid}, {$inc: {balance: total}}, done);
            }
        ], function (err) {
            callback(err, total);
        });
    }
};

module.exports = mongoose.model('cache', cacheSchema);