var morze = require('./libs/morze'),
    MorzeArduinoDevice = require('./libs/morze_arduino_device'),
    MorzeAdapter = require('./libs/morze_adapter'),
    io = require('socket.io').listen(8080);

var arduinoBoard = new MorzeArduinoDevice('/dev/ttyACM0');

io.sockets.on('connection', function (socket) {
    arduinoBoard.connect();

    var adapter = new MorzeAdapter(morze, arduinoBoard);

    var sendSymbol = function (symbol) {
        switch (symbol) {
            case ".":
                socket.emit('dot');
                break;
            case "-":
                socket.emit('dash');
                break;
            default:
                throw new Error("Symbol must be dot (.) or dash (-). Got " + symbol + ".");
                break;
        }
    };

    arduinoBoard.onDot(function () {
        sendSymbol(".");
    });
    arduinoBoard.onDash(function () {
        sendSymbol("-");
    });
    arduinoBoard.onEOM(function () {
        var req = adapter.sendSymbols(morze.EOM);
        req.done(function () {
            morze.EOM.split('').forEach(function (symbol) {
                sendSymbol(symbol);
            });
        });
    });

    socket.on('message', function (data) {
        var req = adapter.sendMessage(data.message);
        req.done(function (encodedMessage) {
            socket.emit('received', {message: encodedMessage});
        });
    });

    socket.on('disconnect', function () {
        arduinoBoard.disconnect();
    });
});
