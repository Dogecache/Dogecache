
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('map', { title: 'Express' });
};