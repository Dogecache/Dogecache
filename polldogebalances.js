var dogeAPI = require('./libraries/dogeapi');
var doge = new dogeAPI();

var User = require('./models/user');
var History = require('./models/history');

var commit = require('./libraries/commit');

const HOT_WALLET = 'dogecachemaster';

exports.poll = function (callback) {
    //console.log('Polling balances...');
    doge.getUsers(function (error, res) {
        if (error) {
            console.log(error);
            return callback(error);
            // @todo Handle error
        }
        var dogeUsers = JSON.parse(res).data.users;
        var usersToUpdate = []; //array of users and balances that need updating

        dogeUsers.forEach(function (dogeUser) {
            var balance = parseFloat(dogeUser.user_balance);

            if (balance > 0 && dogeUser.user_id != HOT_WALLET) {
                usersToUpdate.push({userId: dogeUser.user_id, inc: balance});
            }
        });

        if (usersToUpdate.length == 0) {
            //console.log('No updated balances');
            return callback();
        }

        console.log('Updating ' + usersToUpdate.length + ' balances');

        async.series([
            function (done) {
                async.each(usersToUpdate, function (elem, callback) {
                    console.log('Moving', elem.inc, 'doge from user', elem.userId, 'to ' + HOT_WALLET);
                    doge.moveToUser(HOT_WALLET, elem.userId, elem.inc, function (error, fee) {
                        if (error) {
                            console.log(error);
                            delete usersToUpdate[usersToUpdate.indexOf(elem)]; //remove the user from the update command
                            console.log("ERROR: Moving " + elem.inc + " doge for user " + elem.userId + " has failed.");
                            callback(error);
                        }
                        else {
                            var user = {"_id": elem.userId};//format user as object for history
                            History.addHistory(user, "deposit", 0, elem.inc, 0, 0, function (err, history) {
                                if (err) console.log(err);
                            });
                            console.log('Success:', fee);
                            //Success: {"data":{"success":{"fee":1.25}}}
                            callback();
                        }
                    })
                }, function (err) {
                    if (err) {
                        console.log("Element in async.each failed to process - terminating iterator");
                    }
                    done(err);
                });
            },
            function (done) {
                User.bulkUpdateBalances(usersToUpdate, function (error) {
                    if (error)
                        console.log(error);
                    else
                        console.log('Updated all local balance numbers');
                    done();
                });
            }
        ], callback);
    });
};
