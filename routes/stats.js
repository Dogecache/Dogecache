/*
 * GET stats page.
 */
var History = require('../models/history.js');
var async = require('async');


exports.index = function (req, res) {
    if (req.user) {
        async.parallel({
            history: function (done) {
                //@todo make retrieval limit global
                History.getHistory(req.user, 5, done)
            },
            aggregate: function (done) {
                History.getAggregate(req.user, done)
            }
        }, function (err, data) {
            res.render('stats', {
                title: 'Statistics',
                user: req.user,
                history: data.history,
                aggregate: data.aggregate,
                isMap: false
            })
        })
    }
    else {
        res.redirect('/');
    }

};