var mongoose = require('mongoose');
var User = require('./user');

var cacheSchema = new mongoose.Schema({
    userId: Number,
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
    User.update({id: user.id}, {$inc: {balance: -amount}}, function(err) {
        if (err) return callback(err);

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

module.exports = mongoose.model('cache', cacheSchema);