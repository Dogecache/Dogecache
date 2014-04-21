/*
 * GET settings page.
 */

"use strict";

var googlecharts = require('../libraries/googlechartsapi');

var config = require('../config');

var settings_view = (config.settings.wd_enabled == true || config.settings.wd_enabled == 'true') ? 'settings' : 'settings_disabled'; //load view based on whether withdrawals are enabled

exports.index = function(req, res){
  if (req.user) {
    res.render(settings_view, {
      title: 'Settings | Dogecache',
      user: req.user,
      isMap: false,
      qr: googlecharts.qr(300,300,req.user.dogeAddress),
      min_withdraw: config.settings.min_withdraw,
      tx_fee: config.settings.tx_fee
    });
  } else {
    res.redirect('/');
  }
};