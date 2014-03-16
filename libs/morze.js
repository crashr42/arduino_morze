var fs = require('fs');

var Morse = function () {
    var morzeEncoding = JSON.parse(fs.readFileSync(__dirname + '/morze.json'));

    var EOM = "..-.-";

    return{
        encodeSymbol: function (symbol) {
            var encodedSymbol = morzeEncoding[symbol.toUpperCase()];
            if (!encodedSymbol) {
                throw new Error("Can't encode symbol " + symbol);
            }
            return encodedSymbol;
        },
        encodeString: function (string) {
            var encodedString = "";
            for (var i = 0; i < string.length; ++i) {
                encodedString += this.encodeSymbol(string[i]);
            }
            return encodedString + EOM;
        },
        EOM: EOM
    };
};

module.exports = new Morse();