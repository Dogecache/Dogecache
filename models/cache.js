var mongoose = require('mongoose');
var User = require('./user');
var async = require('async');

var cacheSchema = new mongoose.Schema({
    userId: mongoose.Schema.ObjectId,
    amount: Number,
    loc: {
        index: '2dsphere',
        type: [Number]
    }
});

cacheSchema.statics.addCache = function(user, amount, longitude, latitude, callback) {
    var that = this;

    // check that the user has enough money left
    if (user.balance < amount) return callback("Not enough money remaining");

    // Subtract the amount from the balance
    user.update({$inc: {balance: -amount}}, function(err) {
        if (err) {
            console.log(err);
            return callback(err);
        }

        // Create the cache
        var cache = new that({
            userId: user.id,
            amount: amount,
            loc: [longitude, latitude]
        });

        cache.save(function(err) {
            callback(err, cache);
        });
    });
};

cacheSchema.statics.findCaches = function(user, maxDistance, longitude, latitude, callback) {
    var that = this;
    that.find({
        userId: {
            $ne: user.id
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
    }, function(err, results) {
        callback(err, results);
    });
};

cacheSchema.statics.gatherCaches = function(user, caches, callback) {
    // total up the amount of doge received
    var total = 0;
    for (var i=0; i<caches.length; i++) {
        total += caches[i].amount;
    }

    async.parallel([
        // remove the caches
        function(done) {
            async.each(caches, function(cache, done) {
                cache.remove(done)
            }, done);
        },
        // add balance to user
        function(done) {
            user.update({$inc: {balance: total}}, done);
        }
    ], callback);
};

module.exports = mongoose.model('cache', cacheSchema);