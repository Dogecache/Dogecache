/*
 * GET stats page.
 */
var History = require('../models/history.js');

exports.index = function (req, res) {
    if (req.user) {
        console.log(req.user.fbId);
        History.getHistory(req.user.fbId, 5, function (err, result) {
            console.log(result);
            res.render('stats', {
                title: 'Statistics',
                user: req.user,
                history: result,
                isMap: false
            });
        });
    }
    else {
        res.redirect('/');
    }

};