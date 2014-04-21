"use strict";
var mongoose = require('mongoose');

/*
@todo transaction history currently implements an expedited two phase commit system.
Verification of integrity is NOT done within the system; i.e. it is possible for
the history to be out of sync between history and users if failure occurs during that pt.
Fixes: startup script: verify on startup that all transactions have completed.
*/
var historySchema = new mongoose.Schema({
    userId: mongoose.Schema.ObjectId,                                   //The id of the user
    type: {type: String, enum: ['search', 'withdrawal', 'deposit']},    //type of transaction
    status: {type: Number, enum: [-1,0,1], default: 0},                 //status: -1 is failure, 0 is pending, 1 is complete
    loss: Number,                                                       //amount subtracted from balance
    gain: Number,                                                       //amount added to balance
    date: {type: Date, default: Date.now},                              //full date of the transaction
    txid: String,                                                       //txid for withdrawals and deposits
    loc: {                                                              //location of the search
        index: '2dsphere',
        type: [Number]
    }
});

/**
 * add a new history entry
 * @param user          user object
 * @param type          type of history (deposit, search, withdrawal)
 * @param loss          doge lost (deducted from balance)
 * @param gain          doge gained (added to balance)
 * @param longitude     longitude of search
 * @param latitude      latitude of search
 * @param callback      callback function
 */
historySchema.statics.addHistory = function (user, type, loss, gain, longitude, latitude, callback) {
    var that = this;
    var status = 0;

    //@todo commit status defaults to complete if no val is specified for compatibility with searches
    if (type === 'search' || type === 'deposit') {
        status = 1;
    }
    // Create the entry
    var history = new that({
        userId: user._id,
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

/**
 * change the status of a previously created history entry
 * @param commitID          id of the previously created entry
 * @param data              new data to insert
 * @param newStatus         new status of the entry (-1 or "failed", 0 or "pending", 1 or "success")
 * @param callback          callback function
 */
historySchema.statics.changeCommitStatus = function(commitID, data, newStatus, callback) {
    var that = this;
    data = {} || data;
    if (newStatus == "failed" || newStatus == -1) newStatus = -1;
    if (newStatus == "pending" || newStatus == 0) newStatus = 0;
    if (newStatus == "success" || newStatus == 1) newStatus = 1;
    data.status = newStatus;
    that.update({_id: commitID}, {$set: data }, function (err, result) {
        callback(err, result);
    })
}

/**
 * get the previous limit entries from user
 * @param user              user object
 * @param limit             number of entries to retrieve
 * @param callback          callback function
 */
historySchema.statics.getHistory = function (user, limit, callback) {
    var that = this;
    that
        .find({userId: user._id})
        .sort({'date': -1})
        .limit(limit)
        .exec(function (err, results) {
            callback(err, results);
        });
};

/**
 * get statistics for searches from user
 * @param user          user object
 * @param callback      callback function
 */
historySchema.statics.getAggregate = function(user, callback) {
    var that = this;

    // and here are the grouping request:
    that.aggregate([
        { $match: {userId: user._id, type: "search"} },
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