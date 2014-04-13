var Cache = require('../models/cache');
var User = require('../models/user');
var History = require('../models/history');

var dogeAPI = require('../libraries/dogeapi');
var doge = new dogeAPI();
var async = require('async');

var config = require('../config');

var Commit = require('../libraries/commit');

//@TODO scope these globally
const TX_FEE = 2; //withdrawal fee to cover transaction fee, in doge
const MIN_WITHDRAW = 10; //minimum withdrawal amount, in doge
const ENABLED = true; //whether withdrawals and deposits are enabled @TODO automatic loading of view


function __auth(req, res, callback) {
    if (req.user) return callback(null, req.user);

    User.findOne({uuid: req.body.uuid}, function (err, user) {
        if (!err) {
            req.login(user, function (err) {
                callback(null, user);
            });
        } else {
            callback(err);
        }
    })
}


exports.cache = function (req, res) {
    var user;
    async.waterfall([
        //i. __auth user
        function (done) {
            __auth(req, res, function (err, result) {
                user = result;
                done(err);
            })
        },
        //ii. add the cache
        function (done) {

            Cache.addCache(user, req.body.amount, req.body.longitude, req.body.latitude, function (err, cache) {
                var maxDistance = req.body.amount; // max search radius in meters TODO: scale the amount to the distance via function
                done(err, maxDistance);
            })
        },
        //iii. find caches
        function (maxDistance, done) {
            console.log(user)
            Cache.findCaches(user, maxDistance, req.body.longitude, req.body.latitude, function (err, caches) {
                done(err, caches);
            })
        },
        //iv. gather caches
        function (caches, done) {
            Cache.gatherCaches(user, caches, function (err, gain) {
                done(err, caches, gain);
            })
        },
        //v. add a new transaction entry
        function (caches, gain, done) {
            //@TODO switch to commit-based system
            History.addHistory(user, "search", req.body.amount, gain, req.body.longitude, req.body.latitude, function (err, history) {
                done(caches);
            })
        }
        //done
    ], function (err, caches) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(caches);
        }
    })
};

exports.deposit = function (req, res) {
    __auth(req, res, function (err, user) {
        if (ENABLED == false) {
            res.send("Deposits disabled.");
        }
        else
            res.send(user.dogeAddress);
    });
};

exports.withdraw = function (req, res) {
    __auth(req, res, function (err, user) {
        var address = req.body.send_address;
        var amount = parseInt(req.body.amount);

        // ensure that the user has sufficient balance
        if (amount > user.balance) {
            res.send(500, {error: 'Insufficient user balance.'});
            return;
        }

        //ensure that the user meets the minimum withdraw
        if (amount < MIN_WITHDRAW) {
            res.send(500, {error: 'Withdrawal amount does not meet minimum of ' + MIN_WITHDRAW + ' doge.'})
            return;
        }

        if (ENABLED == false) {
            res.send(500, {error: 'Deposits and withdrawals are currently not enabled.'})
            return;
        }

        //Adjust for transaction fees
        var adj_amount = amount - TX_FEE; //amount actually withdrawn, not deducted
        var commit = new Commit(user, "withdrawal", amount, 0, 0, 0);
        commit.begin(true, function (err, commitID) {
            if (err) {
                console.log(err);
                return res.send(500, {error: 'Error sending funds. No amount withdrawn.'});
            }
            res.send(200, {balance: user.balance, error: 'Doge withdrawn.'});
            //@TODO hotwallet address should be global var
            doge.withdrawFromUser('dogecachemaster', address, adj_amount, config.dogeapiPin, function (err, result) {
                console.log(err, result);
                if (err) {
                    console.log(err);
                    commit.fail(null, true, function(err, result){
                        if (err) console.log(err);
                    });
                }
                else {
                    result = JSON.parse(result);
                    commit.complete({"txid": result.data.txid}, function(err, result){
                        if (err) console.log(err);
                    });
                }
            })

        });
    });
}
