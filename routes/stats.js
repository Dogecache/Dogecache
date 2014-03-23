
/*
 * GET stats page.
 */

exports.index = function(req, res){
  res.render('stats', { title: 'Statistics' });
};