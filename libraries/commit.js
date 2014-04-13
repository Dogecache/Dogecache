/*
Implementation of basic two phase commits
 */

var User = require('../models/user');
var History = require('../models/history');

/**
 * create the new commit container
 * @param user
 * @param type
 * @param loss
 * @param gain
 * @param longditude
 * @param latitude
 * @constructor
 */
function Commit(user, type, loss, gain, longditude, latitude) {
    this.user = user;
    this.type = type;
    this.loss = loss;
    this.gain = gain;
    this.longditude = longditude;
    this.latitude = latitude;
    this.commitID = null;
}

/**
 * Initiate a new commit
 * @param credit        whether or not to credit the account
 * @param callback
 */
Commit.prototype.begin = function (credit, callback) {
    var that = this;
    //update the user balance
    var diff = this.gain - this.loss;
    this.user.balance += diff;
    this.user.save(function (err, res) {
        if (err) {
            callback(err, res);
        }
        else {
            //add the transaction entry
            History.addHistory(that.user, that.type, that.loss, that.gain, that.longditude, that.latitude, function (err, history) {
                that.commitID = history._id;
                callback(err, that.commitID);
            });
        }
    });
}

/**
 * Complete a pending commit
 * @param data                      data to insert
 * @param callback
 * @private
 */
Commit.prototype.complete = function (data, callback) {
    var that = this;
    if (this.commitID == null) callback("Commit not created");
    History.changeCommitStatus(that.commitID, data, "success", function (err, result) {
        callback(err, result);
    })
}

/**
 * Fail a pending commit
 * @param data                      data to insert
 * @param credit                    whether or not to credit the account
 * @param callback
 */
Commit.prototype.fail = function (data, credit, callback) {
    var that = this;
    if (this.commitID == null) callback("Commit not created");
    //roll back user balance
    var diff = this.gain - this.loss;
    that.user.balance -= diff;
    that.user.save(function (err) {
        if (err) console.log(err);
        //fail commit
        History.changeCommitStatus(that.commitID, data, "failed", function (err, result) {
            callback(err, result);
        });
    })
}

module.exports = Commit;