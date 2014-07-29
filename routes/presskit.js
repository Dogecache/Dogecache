
/*
 * GET press page.
 */

exports.index = function(req, res){
  res.render('presskit', {
    title: 'Press Kit | Dogecache',
    user: req.user,
    isMap: false
  });
};