var MorzePromise = require('./morze_promise');

var MorzeAdapter = function (morze, morze_device) {
    var processMessage = function (symbols, encodedMessage, adapterPromise) {
        if (symbols.length <= 0) {
            return adapterPromise.resolve(encodedMessage);
        }

        var devicePromise = morze_device.auto(symbols.shift());
        return devicePromise.then(function() {
            processMessage(symbols, encodedMessage, adapterPromise);
        });
    };

    return {
        sendMessage: function (message) {
            var encodedMessage = morze.encodeString(message);
            return this.sendSymbols(encodedMessage)
        },
        sendSymbols: function (symbols) {
            var promise = new MorzePromise();
            processMessage(symbols.split(''), symbols, promise);
            return promise;
        }
    };
};

module.exports = MorzeAdapter;