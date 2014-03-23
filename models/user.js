var mongoose = require('mongoose');

var dogeAPI = require('../libraries/dogeapi');
doge = new dogeAPI();

var userSchema = new mongoose.Schema({
    fbId: Number,
    displayName: String,
    dogeAddress: String,
    balance: Number
});

userSchema.statics.findOrCreate = function (profile, callback) {
    var that = this;

    function create(dogeAddress) {
        // create new user
        var user = new that({
            fbId: profile.id,
            displayName: profile.displayName,
            dogeAddress: dogeAddress,
            balance: 0
        });
        console.log('New user:', user);
        user.save(function (err, user) {
            if (err) callback(err);
            callback(null, user);
        });
    }

    // try to check if user already exists
    that.findOne({fbId: profile.id}, function (err, result) {
        if (!err && result) {
            // user already exists
            callback(null, result);
        } else {
            // create a new user

            // check if dogeaddress already exists
            doge.getUserAddress(profile.id, function(err, res) {
                if (!err) {
                    create(JSON.parse(res).data.address);
                } else {
                    // generate new address
                    doge.createUser(profile.id, function (error, res) {
                        if (error) {
                            console.log(error);
                            // @TODO: Handle error
                        }
                        create(JSON.parse(res).data.address);
                    });
                }
            });
        }
    })
};

module.exports = mongoose.model('user', userSchema);