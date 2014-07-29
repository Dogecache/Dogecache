/**
 * Loads config data from config.json or from environment variables
 *
 * All config variables are accessed in the format: config.category.key
 * If using environment variables, the key is set as the environment variable.
 */

"use strict";

var fs = require('fs');
if (fs.existsSync('./config.json')) {
    var configData = require('./config.json');
    module.exports = configData;
} else {
    var configTemplate = require('./config.template.json');
    for (var category in configTemplate) { //iterate through each config category
        if (!configTemplate.hasOwnProperty(category) || category == "_comment") continue;
        for (var key in configTemplate[category]) { //retrieve items in each category
            if (!configTemplate[category].hasOwnProperty(key) || key == "_comment") continue;
            if (!process.env.hasOwnProperty(key)) throw new Error('Missing environment variable ' + key);
            configTemplate[category][key] = process.env[key];
        }
    }
    module.exports = configTemplate;
}