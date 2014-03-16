var MorzePromise = function () {
    var currentStatus = "none";

    var callbacks = {};

    var setStatus = function (status) {
        currentStatus = status;
    };

    var getStatus = function () {
        return currentStatus;
    };

    var statusIs = function (status) {
        return getStatus() == status;
    };

    return {
        done: function (cb) {
            callbacks["done"] = cb;

            if (statusIs("done") && callbacks["done"]) {
                callbacks["done"]();
            }
        },
        fail: function (cb) {
            callbacks["fail"] = cb;

            if (statusIs("fail") && callbacks["fail"]) {
                callbacks["fail"]();
            }
        },
        then: function () {
            if (arguments.length > 0) {
                callbacks["then"] = Array.prototype.slice.call(arguments).shift();
            }

            if ((statusIs("done") || statusIs("fail")) && callbacks["then"]) {
                callbacks["then"]();
            }
        },
        resolve: function () {
            setStatus("done");

            if (callbacks["done"]) {
                callbacks["done"](Array.prototype.slice.call(arguments));
            }

            this.then();
        },
        reject: function () {
            setStatus("fail");

            if (callbacks["fail"]) {
                callbacks["fail"](Array.prototype.slice.call(arguments));
            }

            this.then();
        }
    };
};

module.exports = MorzePromise;