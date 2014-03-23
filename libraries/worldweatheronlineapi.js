var config = require('../config');
var defaultSettings = {
    endpoint: 'http://api.worldweatheronline.com/',
    apikey: config.worldweatherapikey
};
var request = require('request');
var validator = require('validator');

function WorldWeatherAPI(settings) {
    settings = settings || {};
    this._endpoint = settings.endpoint || defaultSettings.endpoint;
    this._apikey = settings.apikey || defaultSettings.apikey;
}


/**
 Get worldwide city and town weather by US Zipcode, UK Postcode, Canada Postalcode, IP address, Latitude/Longitude (decimal degree) and city name

 Parameter    Value    Type    Description
 q         string
 Pass US Zipcode, UK Postcode, Canada Postalcode, IP address, Latitude/Longitude (decimal degree) or city name

 format         string
 Output format as JSON, XML and CSV

 extra         string
 (Optional) It allows to request some additional information in the feed return. Possible values are localObsTime, isDayTime, utcDateTime. Two or more values can be passed as comma separated.

 num_of_days         integer
 (Optional) Changes the number of day forecast you need.

 date         string
 (Optional) Get weather for a particular date within next 5 day. It supports today, tomorrow and a date in future. The date should be in the yyyy-MM-dd format. E.g:- date=today or date=tomorrow or date=2013-04-21

 fx         string
 (Optional) Allows you to enable or disable normal weather output. The possible values are yes or no. By default it is yes. E.g:- fx=yes or fx=no

 cc         string
 (Optional) Allows you to enable or disable current weather conditions output. The possible values are yes or no. By default it is yes. E.g:- cc=yes or cc=no

 includelocation         string
 (Optional) Returns the nearest weather point for which the weather data is returned for a given postcode, zipcode and lat/lon values. The possible values are yes or no. By default it is no. E.g:- includeLocation=yes or includeLocation=no

 show_comments         string
 (Optional) Disables CSV/TAB comments from the output. The possible values are yes or no. By default it is yes. E.g:- show_comments=yes or show_comments=no

 callback         string
 (Optional) Only to be used for json callback feature. E.g:- callback=function_name
 **/
WorldWeatherAPI.prototype.localWeather = function (location, format, extraParams, callback) {
    var self = this;
    self._checkAPIKey(function (error) {
        var extraParamsString = "";
        if (error) return callback(error);
        if (!location) return callback('Missing location.');
        if (!format) return callback('Missing result format.');
        if (extraParams && typeof extraParams !== "object")
            return callback("Extra params must be formatted as an object");
        else
            for (var prop in extraParams) {
                extraParamsString += "&" + prop + "=" + extraParams[prop];
            }
        request(self._endpoint + 'free/v1/weather.ashx?akey=' + self._apikey + '&q=' + location + '&format=' + format + extraParamsString, function (error, response, body) {
            if (error) return callback(error);
            if (response.statusCode === 200) {
                return callback(null, body);
            } else {
                return callback(body);
            }
        });
    });
};