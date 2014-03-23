var fs = require('fs');
if (fs.existsSync('./config.json')) {
    var configData = require('./config.json');
    module.exports = configData;
} else {
    var configTemplate = require('./config.template.json');
    for (var key in configTemplate) {
        if (!configTemplate.hasOwnProperty(key)) continue;
        if (!process.env.hasOwnProperty(key)) throw new Error('Missing environment variable ' + key);
        configTemplate[key] = process.env[key];
    }
    module.exports = configTemplate;
}