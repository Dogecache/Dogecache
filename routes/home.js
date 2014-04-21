
/*
 * GET login page.
 */

exports.index = function(req, res){
  res.render('home', {
    title: 'Dogecache',
    isLoggedIn: !!req.user,
    user: req.user,
    isMap: false
  });
};