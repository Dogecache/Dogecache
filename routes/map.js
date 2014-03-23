
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (req.user) {
    res.render('map', {
      title: 'Express',
      user: req.user
    });
  } else {
    res.redirect('/');
  }
};