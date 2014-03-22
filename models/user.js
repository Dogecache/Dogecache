var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    fbId: Number,
    displayName: String,
    dogeAddress: String
});

userSchema.statics.findOrCreate = function(profile, callback) {
    // try to check if user already exists
    this.findOne({fbId: profile.id}, function(err, result) {
        if (!err && result) {
            callback(null, result);
        } else {
            // create new user
            var user = new this({fbId: profile.id, displayName: profile.displayName});

            // TODO: initialize dogeAddress

            user.save(function() {
                if (err) callback(err);
                callback(null, user);
            });
        }
    })
};

module.exports = mongoose.model('user', userSchema);