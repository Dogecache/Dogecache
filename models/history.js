var mongoose = require('mongoose');

/*
@todo transaction history currently implements an expedited two phase commit system.
Verification of integrity is NOT done within the system; i.e. it is possible for
the history to be out of sync between history and users if failure occurs during that pt.
Fixes: startup script: verify on startup that all transactions have completed.
*/
var historySchema = new mongoose.Schema({
    uuid: String,                                                       //The facebook id of the user
    type: {type: String, enum: ['search', 'withdrawal', 'deposit']},    //type of transaction
    status: {type: Number, enum: [-1,0,1], default: 1},                 //status: -1 is failure, 0 is pending, 1 is complete
    loss: Number,                                                       //amount subtracted from balance
    gain: Number,                                                       //amount added to balance
    date: {type: Date, default: Date.now},                              //full date of the transaction
    loc: {                                                              //location of the search
        index: '2dsphere',
        type: [Number]
    }
});

historySchema.statics.addHistory = function (user, type, loss, gain, longitude, latitude, callback) {
    var that = this;
    var status = 0;

    //@todo commit status defaults to complete if no val is specified for compatibility with searches
    if (type === 'search' || type === 'deposit') {
        status = 1;
    }
    // Create the entry
    var history = new that({
        uuid: user.uuid,
        type: type,
        status: status,
        loss: loss,
        gain: gain,
        loc: [longitude, latitude]
    });

    history.save(function (err) {
        callback(err, history);
    });
};

historySchema.statics.changeCommitStatus = function(commitID, newStatus, callback) {
    var that = this;
    if (newStatus == "failure" || newStatus == -1) newStatus = -1;
    if (newStatus == "pending" || newStatus == 0) newStatus = 0;
    if (newStatus == "success" || newStatus == 1) newStatus = 1;
    that.update({_id: commitID}, {$set: {status: newStatus} }, function (err, result) {
        callback(err, result);
    })
}

historySchema.statics.getHistory = function (user, limit, callback) {
    var that = this;
    that
        .find({uuid: user.uuid})
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
        { $match: {uuid: user.uuid, type: "search"} },
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