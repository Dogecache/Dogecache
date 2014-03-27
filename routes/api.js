var Cache = require('../models/cache');
var User = require('../models/user');
var History = require('../models/history');

var dogeAPI = require('../libraries/dogeapi');
var doge = new dogeAPI();
var async = require('async');

var config = require('../config');

const WAGER_FEE = 1; //wager fee deducted at time of wager, in percent
const TX_FEE = 1; //withdrawal fee to cover transaction fee, in doge
const MIN_WITHDRAW = 10; //minimum withdrawal amount, in doge


function auth(req, res, callback) {
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
        //i. auth user
        function (done) {
            auth(req, res, function (err, result) {
                user = result;
                done(err);
            })
        },
        //ii. add the cache
        function (done) {
            var amount = req.body.amount*(1-WAGER_FEE*0.01);
            Cache.addCache(user, amount, req.body.longitude, req.body.latitude, function (err, cache) {
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
        //v. add a new transaction entry @todo this can be parallel
        function (caches, gain, done) {
            History.addHistory(user, req.body.amount, gain, req.body.longitude, req.body.latitude, function (err, history) {
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
    auth(req, res, function (err, user) {
        res.send(user.dogeAddress);
    });
};

exports.withdraw = function (req, res) {
    auth(req, res, function (err, user) {
        var address = req.body.address;
        var amount = req.body.amount;

        // ensure that the user has sufficient balance
        if (amount > user.balance - 1000) {
            res.send(500, {error: 'Insufficient user balance. You must maintain a balance of 1000 doge.'});
            return;
        }

        //ensure that the user meets the minimum withdraw
        if (amount < MIN_WITHDRAW) {
            res.send(500,{error: 'Withdrawal amount does not meet minimum of ' + MIN_WITHDRAW + 'doge.'})
            return;
        }

        var adj_amount = amount - TX_FEE;

        doge.withdrawFromUser('dogecachemaster', address, adj_amount, config.dogeapiPin, function (err, result) {
            if (err) return res.send(500, {error: 'Error sending funds. No amount withdrawn.'});
            user.balance -= amount;
            user.save(function (err) {
                res.send(result);
            });
        });
    });
};
