/*
 * GET settings page.
 */
var googlecharts = require('../libraries/googlechartsapi');

exports.index = function(req, res){
  if (req.user) {
    res.render('settings', {
      title: 'Settings',
      user: req.user,
      isMap: false,
      qr: googlecharts.qr(300,300,req.user.dogeAddress)
    });
  } else {
    res.redirect('/');
  }
};