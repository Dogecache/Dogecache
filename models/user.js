var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    fbId: Number,
    displayName: String,
    dogeAddress: String,
    balance: Number
});

userSchema.statics.findOrCreate = function(profile, callback) {
    var that = this;
    // try to check if user already exists
    that.findOne({fbId: profile.id}, function(err, result) {
        if (!err && result) {
            callback(null, result);
        } else {
            // create new user
            var user = new that({
                fbId: profile.id,
                displayName: profile.displayName,
                balance: 0}
            );

            // TODO: initialize dogeAddress

            user.save(function() {
                if (err) callback(err);
                callback(null, user);
            });
        }
    })
};

module.exports = mongoose.model('user', userSchema);