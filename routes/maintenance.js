exports.index = function(req, res){
  res.render('maintenance', { title: 'Woops! | Dogecache', isMap: false });
};