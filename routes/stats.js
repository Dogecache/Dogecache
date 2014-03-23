
/*
 * GET stats page.
 */

exports.index = function(req, res){
  if (req.user) {
    res.render('stats', { title: 'Statistics' });
  else {
    res.redirect('/');
  }
};