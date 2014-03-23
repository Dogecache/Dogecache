var mongoose = require('mongoose');
var User = require('./user');

var historySchema = new mongoose.Schema({
    fbId: Number,
    loss: Number,
    gain: Number,
    date: {type: date, default: Date.now},
    loc: {
        index: '2dsphere',
        type: [Number]
    }
});

historySchema.statics.addHistory = function (user, loss, gain, longitude, latitude, callback) {
    var that = this;

    // Create the entry
    var history = new that({
        userId: user.id,
        loss: loss,
        gain: gain,
        loc: [longitude, latitude]
    });

    history.save(function (err) {
        callback(err, history);
    });
};

historySchema.statics.retriveHistory = function (userid, limit, callback) {
    var that = this;
    that
        .find({fbId: userid})
        .sort({'date': -1})
        .limit(limit)
        .exec(function (err, results) {
            callback(err, results);
        });
};


module.exports = mongoose.model('history', historySchema);