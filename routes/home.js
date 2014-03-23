
/*
 * GET login page.
 */

exports.index = function(req, res){
  res.render('home', { title: 'Login', isLoggedIn: !!req.user, isMap: false });
};