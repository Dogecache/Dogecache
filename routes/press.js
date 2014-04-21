
/*
 * GET press page.
 */

exports.index = function(req, res){
  if (req.user) {
    res.render('press', {
      title: 'Press | Dogecache',
      user: req.user,
      isMap: false
    });
  } else {
    res.redirect('/');
  }
};