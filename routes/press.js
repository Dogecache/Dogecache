
/*
 * GET press page.
 */
"use strict";
exports.index = function(req, res){
  res.render('press', {
    title: 'Press | Dogecache',
    user: req.user,
    isMap: false
  });
};