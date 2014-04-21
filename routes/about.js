
/*
 * GET about page.
 */

exports.index = function(req, res){
  if (req.user) {
    res.render('about', {
      title: 'About | Dogecache',
      user: req.user,
      isMap: false
    });
  } else {
    res.redirect('/');
  }
};