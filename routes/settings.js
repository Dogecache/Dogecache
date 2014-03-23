/*
 * GET settings page.
 */
var googlecharts = require('../libraries/googlechartsapi');

exports.index = function(req, res){
  res.render('settings', {
    title: 'Settings',
    user: req.user,
    qr: googlecharts.qr(600,600,req.user.dogeAddress)
  });
};