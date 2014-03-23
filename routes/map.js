
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (req.user) {
    res.render('map', {
      title: 'DogeCache',
      user: req.user,
      isMap: true
    });
  } else {
    res.redirect('/');
  }
};