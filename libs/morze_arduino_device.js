var j5 = require('johnny-five');
var MorzePromise = require('./morze_promise');

var MorzeArduinoDevice = function (port, options, callback) {
    var morzeBoard = new j5.Board(port, options, callback);
    var buttonCallbacks = {};
    var elements = {};

    var onReady = function (cb) {
        if (morzeBoard.isReady) {
            cb();
        }
        else {
            morzeBoard.on('ready', function () {
                cb();
            });
        }
    };

    var dotLed = function (cb) {
        onReady(function () {
            if (!elements["dotLed"]) {
                elements["dotLed"] = new j5.Led(13);
            }

            cb.call(elements["dotLed"]);
        });
    };

    var dashLed = function (cb) {
        onReady(function () {
            if (!elements["dashLed"]) {
                elements["dashLed"] = new j5.Led(12);
            }

            cb.call(elements["dashLed"]);
        });
    };

    var beepButton = function (cb) {
        onReady(function () {
            if (!elements["beepButton"]) {
                elements["beepButton"] = new j5.Button({
                    pin: 7,
                    holdtime: 200
                });
            }

            cb.call(elements["beepButton"]);
        });
    };

    var endButton = function (cb) {
        onReady(function () {
            if (!elements["endButton"]) {
                elements["endButton"] = new j5.Button({
                    pin: 6,
                    holdtime: 200
                });
            }

            cb.call(elements["endButton"]);
        });
    };

    var beeper = function (cb) {
        onReady(function () {
            if (!elements["beeper"]) {
                elements["beeper"] = j5.Pin(11);
            }

            cb.call(elements["beeper"]);
        });
    };

    var statusLed = function (cb) {
        onReady(function () {
            if (!elements["statusLed"]) {
                elements["statusLed"] = j5.Led(10);
            }

            cb.call(elements["statusLed"]);
        });
    };

    var dot = function (promise) {
        onReady(function () {
            dotLed(function () {
                this.brightness(255);
            });

            beeper(function () {
                this.high();
            });

            morzeBoard.wait(100, function () {
                dotLed(function () {
                    this.brightness(0);
                });
                beeper(function () {
                    this.low();
                });

                morzeBoard.wait(100, function () {
                    if (promise) {
                        promise.resolve();
                    }
                });
            });
        });
    };

    var dash = function (promise) {
        onReady(function () {
            dashLed(function () {
                this.brightness(255);
            });
            beeper(function () {
                this.high();
            });

            morzeBoard.wait(300, function () {
                dashLed(function () {
                    this.brightness(0);
                });
                beeper(function () {
                    this.low();
                });

                morzeBoard.wait(100, function () {
                    if (promise) {
                        promise.resolve();
                    }
                });
            });
        });
    };

    onReady(function () {
        dotLed(function () {
            this.brightness(0);
        });

        dashLed(function () {
            this.brightness(0);
        });

        endButton(function () {
            this.on('down', function () {
                if (buttonCallbacks["onEOM"]) {
                    buttonCallbacks["onEOM"]();
                }
            })
        });

        beepButton(function () {
            var holdTriggered = false;

            this.on('up', function () {
                if (!holdTriggered && buttonCallbacks["onDot"]) {
                    buttonCallbacks["onDot"]();
                    dot();
                }

                holdTriggered = false;
            });

            this.on('hold', function () {
                holdTriggered = true;

                if (buttonCallbacks["onDash"]) {
                    buttonCallbacks["onDash"]();
                    dash();
                }
            });
        });
    });

    return {
        dot: function () {
            var promise = new MorzePromise();
            dot(promise);
            return promise;
        },
        dash: function () {
            var promise = new MorzePromise();
            dash(promise);
            return promise;
        },
        auto: function (symbol) {
            var result = undefined;
            switch (symbol) {
                case ".":
                    result = this.dot();
                    break;
                case "-":
                    result = this.dash();
                    break;
                default:
                    throw new Error("Symbol must be dot (.) or dash (-). Got " + symbol + ".");
                    break;
            }
            return result;
        },
        onDot: function (cb) {
            buttonCallbacks["onDot"] = cb;
        },
        onDash: function (cb) {
            buttonCallbacks["onDash"] = cb;
        },
        onEOM: function (cb) {
            buttonCallbacks["onEOM"] = cb;
        },
        connect: function () {
            statusLed(function () {
                this.brightness(255);
            });
        },
        disconnect: function () {
            statusLed(function () {
                this.brightness(0);
            });
        }
    };
};

module.exports = MorzeArduinoDevice;