var Cache = require('../models/cache');
var User = require('../models/user');
var History = require('../models/history');

var dogeAPI = require('../libraries/dogeapi');
var doge = new dogeAPI();

var config = require('../config');

const FEE = 1; //withdrawal fee, in percent



function auth(req, res, callback) {
    if (req.user) return callback(null, req.user);

    // TODO: more secure API key login method
    User.findOne({fbId: req.body.fbId}, function(err, user) {
        if (!err) {
            req.login(user, function(err) {
                callback(null, user);
            });
        } else {
            callback(err);
        }
    })
}

exports.cache = function(req, res) {
    // Auth user
    auth(req, res, function(err, user) {
        // First, add the cache
        Cache.addCache(user, req.body.amount, req.body.longitude, req.body.latitude, function(err, cache) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                // Second, find caches
                var maxDistance = req.body.amount; // max search radius in meters TODO: scale the amount to the distance via function
                //TODO use async
                Cache.findCaches(user, maxDistance, req.body.longitude, req.body.latitude, function(err, caches) {
                    // Third, gather caches
                    Cache.gatherCaches(user, caches, function(err, gain) {
                        //Add a new transaction entry
                       History.addHistory(user, req.body.amount, gain, req.body.longitude, req.body.latitude, function(err, history) {
                           // Done
                           res.send(caches);
                       })


                    });
                })
            }
        });
    });
};

exports.deposit = function(req, res) {
    auth(req, res, function(err, user) {
        res.send(user.dogeAddress);
    });
};

exports.withdraw = function(req, res) {
    auth(req, res, function(err, user) {
        var address = req.body.address;
        var amount = req.body.amount;

        // ensure that the user has sufficient balance
        if (amount > user.balance - 1000) {
            res.send(500, {error: 'Insufficient user balance. You must maintain a balance of 1000 doge.'});
            return;
        }

        var adj_amount = Math.floor(amount*(1 - FEE*0.01));

        doge.withdrawFromUser('dogecachemaster', address, adj_amount, config.dogeapiPin, function(err, result) {
            if (err) return res.send(500, {error: 'Error sending funds. No amount withdrawn.'});
            user.balance -= amount;
            user.save(function(err) {
                res.send(result);
            });
        });
    });
};
