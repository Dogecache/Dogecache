/*
Implementation of basic two phase commits
 */

var User = require('../models/user');
var History = require('../models/history');

//@todo convert longitude, latitude to array
/**
 * create the new commit container
 * @param user                          user object
 * @param type                          commit type: -1 or "failed", 0 or "pending", 1 or "success"
 * @param loss                          doge lost (deducted from balance)
 * @param gain                          doge gained (added to balance)
 * @param longitude                     longitude of transaction
 * @param latitude                      latitude of transaction
 * @constructor
 */
function Commit(user, type, loss, gain, longitude, latitude) {
    this.user = user;
    this.type = type;
    this.loss = loss;
    this.gain = gain;
    this.longitude = longitude;
    this.latitude = latitude;
    this.commitID = null;
}

/**
 * Initiate a new commit
 * @param credit            whether or not to credit the account
 * @param callback          callback function
 */
Commit.prototype.begin = function (credit, callback) {
    var that = this;
    //update the user balance
    var diff = this.gain - this.loss;
    this.user.balance += diff;
    this.user.save(function (err, res) {
        if (err) {
            callback(err, null);
        }
        else {
            //add the transaction entry
            History.addHistory(that.user, that.type, that.loss, that.gain, that.longitude, that.latitude, function (err, history) {
                that.commitID = history._id;
                callback(err, that.commitID);
            });
        }
    });
}

/**
 * Complete a pending commit
 * @param data                      data to insert
 * @param callback                  callback function
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