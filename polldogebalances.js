var dogeAPI = require('./libraries/dogeapi');
var doge = new dogeAPI();

var User = require('./models/user');

const HOT_WALLET = 'dogecachemaster';

exports.poll = function (callback) {
    console.log('Polling balances...');
    doge.getUsers(function (error, res) {
        if (error) {
            console.log(error);
            // @todo Handle error
        }
        var users = JSON.parse(res).data.users;
        var usersToUpdate = []; //array of users and balances that need updating

        users.forEach(function (user) {
            var balance = parseFloat(user.user_balance);

            if (balance > 0 && user.user_id != HOT_WALLET) {
                var userid = user.user_id;
                usersToUpdate.push({userid: userid, inc: balance});
            }
        });

        if (usersToUpdate.length == 0) {
            console.log('No updated balances');
            return callback();
        }

        console.log('Updating ' + usersToUpdate.length + ' balances');

        async.parallel([
            function (done) {
                async.each(usersToUpdate, function (elem, callback) {
                    console.log('Moving', elem.inc, 'doge from user', elem.userid, 'to ' + HOT_WALLET);
                    doge.moveToUser(HOT_WALLET, elem.userid, elem.inc, function (error, transactionid) {
                        if (error) {
                            console.log(error);
                            // @todo Handle error
                        }
                        console.log('Success:', transactionid);
                        done();
                    })
                });
            },
            function (done) {
                User.bulkUpdateBalances(usersToUpdate, function (error) {
                    if (error)
                        console.log(error);
                    else
                        console.log('Updated all local balance numbers');
                });
            }
        ], callback);
    });
};
