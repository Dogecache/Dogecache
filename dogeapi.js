"use strict";
var dogeAPI = require('dogeapi');
var config = require('./config');
module.exports = new dogeAPI({
    endpoint: 'https://dogeapi.com/',
    apikey: config.dogeapiKey
});
