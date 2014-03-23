dogeAPI = require('libraries/dogeapi');
doge = new dogeAPI();

var User = require('../models/user');

doge.getUsers(function (error, res) {
    if (error) {
        // @todo Handle error
    }
    var users = res.data.users;
    var usersToUpdate = []; //array of users and balances that need updating

    async.each(users, function (elem, callback) {
        var balance = parseFloat(elem.user_balance);

        if (balance > 0) {
            var userid = elem.user_id;

            doge.moveToUser('dogecachemaster', userid, balance, function (error, transactionid) {
                if (error) {
                    // @todo Handle error
                }
                usersToUpdate.push({userid: userid, inc: balance});
                console.log(transactionid);

                callback();
            })
        }
    }, function() {
        User.bulkUpdateBalances(usersToUpdate, function (error) {});
    });
});