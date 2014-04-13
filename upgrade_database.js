/**
 * Database schema updates
 *
 */

var Cache = require('./models/cache');
var User = require('./models/user');
var History = require('./models/history');
var async = require('async');

/**
 V1 UPGRADE
 Upgrade database with the following fixes:
 * Use uuid instead of fbid in references in both caches and histories databases
 * Update history schema to support two phase commits (add uuid, type, status fields)
 **/
exports.upgradev1 = function () {
    User.find({}, 'fbId uuid', function (err, users) {
        if (err) {
            console.log('error in retrieving fbid uuid pairs')
            callback(err);
        } else {
            console.log("Retrieved the following users:");
            console.log(users);
            console.log("Beginning to update history and cache schemas.")
            async.each(users, function (user, callback) {
                async.parallel([
                    function (done) {
                        History.update({fbId: user.fbId}, {uuid: user.uuid, type: 'search', status: 1}, {multi: true}, function (err, num, res) {
                            if (err) {
                                console.log("Critical error: update failed for user " + user.uuid + " in db histories.");
                            }
                            console.log("Updating db histories for user " + user.uuid);
                            console.log(num + " results affected.");
                            done();
                        })
                    },
                    function (done) {
                        Cache.update({fbId: user.fbId}, {uuid: user.uuid}, {multi: true}, function (err, num, res) {
                            if (err) {
                                console.log("Critical error: update failed for user " + user.uuid + " in db caches.")
                            }
                            console.log("Updating db caches for user " + user.uuid);
                            console.log(num + " results affected.");
                            done();
                        })
                    }
                ], function(err){
                    if (err)
                    console.log("Error in parallel op to update db caches and db histories.");
                    callback();
                })
            }, function (error) {
                if (error) {
                    console.log("Error in async.each iterator.")
                }
                console.log("Update operation completed.");

            });
        }
    })
}