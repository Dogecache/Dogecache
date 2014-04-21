/*
 * GET settings page.
 */

"use strict";

var googlecharts = require('../libraries/googlechartsapi');

var config = require('../config');

var settings_view = config.settings.wd_enabled ? 'settings' : 'settings_disabled'; //load view based on whether withdrawals are enabled

exports.index = function(req, res){
  if (req.user) {
    res.render(settings_view, {
      title: 'Settings | Dogecache',
      user: req.user,
      isMap: false,
      qr: googlecharts.qr(300,300,req.user.dogeAddress)
    });
  } else {
    res.redirect('/');
  }
};