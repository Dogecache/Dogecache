var mongoose = require('mongoose');

var dogeAPI = requrie('libraries/dogeapi')
doge = new dogeAPI();

var userSchema = new mongoose.Schema({
    fbId: Number,
    displayName: String,
    dogeAddress: String
});

userSchema.statics.findOrCreate = function (profile, callback) {
    var that = this;
    var user;
    // try to check if user already exists
    that.findOne({fbId: profile.id}, function (err, result) {
        if (!err && result) {
            callback(null, result);
        } else {
            //initialize dogeaddress
            doge.createUser(profile.id, function (error, res) {
                if (error) {
                    // @TODO: Handle error
                }
                var paymentAddress = res.data.address;
                // create new user
                user = new that({fbId: profile.id, displayName: profile.displayName, dogeAddress: paymentAddress});
            });


            user.save(function () {
                if (err) callback(err);
                callback(null, user);
            });
        }
    })
};

module.exports = mongoose.model('user', userSchema);