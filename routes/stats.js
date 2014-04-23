/*
 * GET stats page.
 */
"use strict";

var History = require('../models/history');
var moment = require('moment');
var config = require('../config');
var async = require('async');

var RETRIEVAL_LIMIT = config.settings.history_items;


exports.index = function (req, res) {
    if (req.user) {
        async.parallel({
            history: function (done) {
                History.getHistory(req.user, RETRIEVAL_LIMIT, done)
            },
            aggregate: function (done) {
                History.getAggregate(req.user, done)
            }
        }, function (err, data) {
            res.render('stats', {
                title: 'Statistics | Dogecache',
                user: req.user,
                history: data.history,
                aggregate: data.aggregate,
                isMap: false,
                moment: moment
            })
        })
    }
    else {
        res.redirect('/');
    }

};