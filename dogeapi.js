"use strict";

var config = require('./config');

var request = require('request');
var validator = require('validator');

var BlockIo = require('block_io');

function DogeAPI(api_key, secret_pin) {
    this.block_io = new BlockIo(api_key);
    this.secret_pin = secret_pin;
    this.user_ids = {};
}

DogeAPI.prototype.createUser = function(userID, callback) {
    var self = this;
    if(!userID) return callback('Missing user id.');
    if(!validator.isAlphanumeric(userID)) return callback('Invalid user id.');

    this.block_io.create_user({'label': userID}, function(err, resp) {
        if (!err && resp.status == "success") {
            self.user_ids[userID] = resp.data.user_id;
            return callback(null, JSON.stringify(resp));
        } else {
            return callback(resp);
        }
    });
};

DogeAPI.prototype.withdrawFromUser = function(userID, paymentAddress, amount, pin, callback) {
    var self = this;
    if(!userID) return callback('Missing user id.');
    if(!paymentAddress) return callback('Missing payment address.');
    if(!amount) return callback('Missing amount to withdraw.');
    if(!validator.isAlphanumeric(userID)) return callback('Invalid user id.');

    this.block_io.withdraw_from_user({
        'amount': amount,
        'payment_address': paymentAddress,
        'from_user_ids': this.user_ids[userID].toString(),
        'pin': this.secret_pin
    }, function(err, resp) {
        if (!err && resp.status == "success") {
            return callback(null, JSON.stringify(resp));
        } else {
            return callback(resp);
        }
    });
};

DogeAPI.prototype.moveToUser = function(toUserID, fromUserID, amount, callback) {
    var self = this;
    if(!toUserID) return callback('Missing user id to send to.');
    if(!fromUserID) return callback('Missing user id to send from.');
    if(!amount) return callback('Missing amount to move.');

    this.block_io.withdraw_from_user({
        'amount': amount,
        'from_user_ids': this.user_ids[fromUserID].toString(),
        'to_user_id': this.user_ids[toUserID].toString(),
        'pin': this.secret_pin
    }, function(err, resp) {
        if (!err && resp.status == "success") {
            resp.data.success = {};
            resp.data.success.fee = parseFloat(resp.data.network_fee) + parseFloat(resp.data.blockio_fee);
            return callback(null, JSON.stringify(resp));
        } else {
            return callback(resp);
        }
    });
};

DogeAPI.prototype.getUsers = function(callback) {
    var self = this;

    this.block_io.get_users(function(err, resp) {
        if (!err && resp.status == "success") {
            var new_resp = {"data": {"users": []}};
            for (var i=0; i<resp.data.addresses.length; i++) {
                var user = resp.data.addresses[i];
                var new_user = {
                    'user_id': user.label,
                    'payment_address': user.address,
                    'user_balance': user.available_balance
                };
                new_resp.data.users.push(new_user);
                self.user_ids[user.label] = user.user_id;
            }
            return callback(null, JSON.stringify(new_resp));
        } else {
            return callback(resp);
        }
    });
};

module.exports = new DogeAPI(config.setup.blockio_key, config.setup.blockio_pin);
