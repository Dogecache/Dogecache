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
            Cache.find({
                loc: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [req.longitude, req.latitude]
                        },
                        $maxDistance: maxDistance
                    }
                }
            }, function(err, results) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send(results);
                }
            });
        }
    });
};
