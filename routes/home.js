/*
 * GET login page.
 */
"use strict";
exports.index = function(req, res){
  res.render('home', {
    title: 'Dogecache',
    isLoggedIn: !!req.user,
    user: req.user,
    isMap: false
  });
};