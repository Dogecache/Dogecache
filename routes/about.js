
/*
 * GET about page.
 */

exports.index = function(req, res){
  res.render('about', {
    title: 'About | Dogecache',
    user: req.user,
    isMap: false
  });
};