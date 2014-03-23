/*
 * GET stats page.
 */
var History = require('../models/history.js');
//@TODO Async the data retrieval
//@TODO pass in user for consistency

exports.index = function (req, res) {
    if (req.user) {
        History.getHistory(req.user.fbId, 5, function (err, history) {
            History.getAggregate(req.user.fbId, function (err, aggregate) {
                console.log(aggregate);
                res.render('stats', {
                    title: 'Statistics',
                    user: req.user,
                    history: history,
                    aggregate: aggregate,
                    isMap: false
                });
            });
        });
    }
    else {
        res.redirect('/');
    }

};