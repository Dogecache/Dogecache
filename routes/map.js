/*
 * GET map page.
 */
"use strict";
exports.index = function(req, res){
  if (req.user) {
    res.render('map', {
      title: 'Map | Dogecache',
      user: req.user,
      isMap: true
    });
  } else {
    res.redirect('/');
  }
};