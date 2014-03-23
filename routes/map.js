
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (req.user) {
    res.render('map', { title: 'Express' });
  } else {
    res.redirect('/');
  }
};