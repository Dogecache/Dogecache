var mongoose = require('mongoose');

var historySchema = new mongoose.Schema({
    fbId: Number,
    loss: Number,
    gain: Number,
    date: {type: Date, default: Date.now},
    loc: {
        index: '2dsphere',
        type: [Number]
    }
});

historySchema.statics.addHistory = function (user, loss, gain, longitude, latitude, callback) {
    var that = this;

    // Create the entry
    var history = new that({
        fbId: user.fbId,
        loss: loss,
        gain: gain,
        loc: [longitude, latitude]
    });

    history.save(function (err) {
        callback(err, history);
    });
};

historySchema.statics.getHistory = function (user, limit, callback) {
    var that = this;
    that
        .find({fbId: user.fbId})
        .sort({'date': -1})
        .limit(limit)
        .exec(function (err, results) {
            callback(err, results);
        });
};

historySchema.statics.getAggregate = function(user, callback) {
    var that = this;

    // and here are the grouping request:
    that.aggregate([
        { $match: {fbId: user.fbId} },
        {
            $group: {
                _id: null,
                totalLoss: { $sum: '$loss'},
                totalGain: { $sum: '$gain'},
                maxGain: {$max: '$gain'},
                maxLoss: {$max: '$loss'},
                avgGain: {$avg: '$gain'},
                avgLoss: {$avg: '$loss'},
                totalSearches: { $sum: 1 }
            }
        }]
    , function(err, res){
        callback(err, res)
    });
}


module.exports = mongoose.model('history', historySchema);