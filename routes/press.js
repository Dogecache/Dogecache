
/*
 * GET press page.
 */

exports.index = function(req, res){
  res.render('press', {
    title: 'Press | Dogecache',
    user: req.user,
    isMap: false
  });
};