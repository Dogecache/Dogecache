dogeAPI = require('libraries/dogeapi');

doge = new dogeAPI();

doge.getUsers(function (error, res) {
    if (error) {
        // @todo Handle error
    }
    var users = res.data.users;
    users.forEach(function (elem) {
        var balance = parseFloat(elem.user_balance);

        if (balance > 0) {
            var userid = elem.user_id;

            doge.moveToUser('dogcache_master', userid, balance, function (error, transactionid) {
                if (error) {
                    // @todo Handle error
                }
                /*@todo UPDATE DATABASE WITH NEW BALANCE*/
                console.log(transactionid);
            })
        }
    });
});