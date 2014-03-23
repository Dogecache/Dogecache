var Cache = require('../models/cache');

exports.cache = function(req, res) {
    // First, add the cache
    Cache.addCache(req.user, req.body.amount, req.body.longitude, req.body.latitude, function(err, cache) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            // Second, find caches

            // max search radius in meters
            var maxDistance = res.query.amount; // TODO: scale the amount to the distance via function
            Cache.findCaches(req.user, maxDistance, req.body.longitude, req.body.latitude, function(err, caches) {
                res.send(caches);
            })
        }
    });
};
