var mongoose = require('mongoose');

var cacheSchema = new mongoose.Schema({
    user: Number,
    amount: Number,
    loc: {
        index: '2dsphere',
        type: [Number]
    }
});

module.exports = mongoose.model('cache', cacheSchema);