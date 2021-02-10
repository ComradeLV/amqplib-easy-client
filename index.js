"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var chalk = require('chalk');
var amqp = require("amqplib/callback_api");
var AmqpClient = /** @class */ (function () {
    //Public methods
    function AmqpClient(conn_string, queue_list, consumer_list) {
        if (conn_string === void 0) { conn_string = ""; }
        if (queue_list === void 0) { queue_list = []; }
        if (consumer_list === void 0) { consumer_list = []; }
        this._connectionString = "";
        this._connectionPending = false;
        this._statusQueueInitialized = false;
        this._connection = null;
        this._channel = null;
        this._queueList = [];
        this._consumerList = [];
        this._logPrefix = "[AMQP_CLIENT]";
        this._statusQueue = "AMQP_CLIENT_STATUS";
        this._connectionString = conn_string;
        this._queueList = queue_list;
        this._consumerList = consumer_list;
    }
    AmqpClient.prototype.setConnectionString = function (conn_string) {
        this._connectionString = conn_string;
    };
    AmqpClient.prototype.setStatusQueueName = function (queue_name) {
        this.addQueue(queue_name);
        this._statusQueueInitialized = true;
        this._statusQueue = queue_name;
    };
    AmqpClient.prototype.addQueue = function (queue_name, options) {
        if (options === void 0) { options = { durable: false }; }
        this._queueList.push({ name: queue_name, options: options });
    };
    AmqpClient.prototype.addConsumer = function (queue_name, callback, options) {
        if (options === void 0) { options = { noAck: true }; }
        this._consumerList.push({ name: queue_name, callback: callback, options: options });
    };
    AmqpClient.prototype.setClientId = function (clientId) {
        this._selfId = clientId;
    };
    //Perform a connection with defined queues and consumers
    AmqpClient.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var validate;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._selfId) {
                            this._selfId = this._createSelfId();
                        }
                        validate = true;
                        if (this._queueList.length == 0) {
                            validate = false;
                            this.log(chalk.red("[✘]"), "Queue list shouldn't be empty when opening a new connection");
                        }
                        if (this._consumerList.length == 0) {
                            validate = false;
                            this.log(chalk.red("[✘]"), "Consumer list shouldn't be empty when opening a new connection");
                        }
                        if (!validate) return [3 /*break*/, 2];
                        this._connectionPending = true;
                        return [4 /*yield*/, amqp.connect(this._connectionString, function (err, conn) { return _this.connectionCallback(err, conn); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this._statusQueueInitialized) {
                            this.addQueue(this._statusQueue);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AmqpClient.prototype.sendMessage = function (queue, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this._connection) {
                    try {
                        this._channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
                    }
                    catch (err) {
                        this.log(chalk.red("[✘]"), "Error while sending message");
                        this._connection = null;
                        this._channel = null;
                        this.connect();
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    //Redefine this method, if you need to have your own logging
    AmqpClient.prototype.log = function (content) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log.apply(console, __spreadArrays([this._logPrefix, content.toString()], args));
    };
    AmqpClient.prototype.setLogPrefix = function (prefix) {
        this._logPrefix = prefix;
    };
    AmqpClient.prototype.updateConnectionStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._updateClientStatus();
                return [2 /*return*/];
            });
        });
    };
    //Private methods
    AmqpClient.prototype.connectionCallback = function (err, conn) {
        var _this = this;
        if (err) {
            this.log(chalk.red("[✘]"), "Connection error: ", err.toString());
        }
        else {
            this._connection = conn;
            this._connection.createChannel(function (err, channel) { return _this.channelCallback(err, channel); });
            this.log(chalk.green("[✔]"), "Connection established!");
            this.log(chalk.blue("[" + chalk.bold("i") + "]"), "Client ID is", chalk.yellow(this._selfId));
        }
        this._connectionPending = false;
    };
    //This metod is called, when the connection is received in connect method
    //Each pre-defined queue and consumer are asserted or connected to the channel
    AmqpClient.prototype.channelCallback = function (err, channel) {
        var _this = this;
        if (err) {
            this.log(chalk.red("[✘]"), "Error while creating channel", err.toString());
        }
        else {
            this._channel = channel;
            //Connecting queues defined in list
            this._queueList.forEach(function (queue) {
                _this._channel.assertQueue(queue.name, queue.options);
            });
            //Connecting consumers defined in list
            this._consumerList.forEach(function (consumer) {
                _this._channel.consume(consumer.name, consumer.callback, consumer.options);
            });
        }
    };
    AmqpClient.prototype._updateClientStatus = function () {
        if (this._connection) {
            try {
                this._channel.sendToQueue(this._statusQueue, Buffer.from(JSON.stringify({ clientId: this._selfId, dt: new Date() })));
            }
            catch (err) {
                this.log(chalk.red("[✘]"), "Connection lost. Reconnecting", err.toString());
                this._connection = null;
                this._channel = null;
                this.connect();
            }
        }
        else if (!this._connectionPending) {
            this._connection = null;
            this._channel = null;
            this.connect();
        }
    };
    AmqpClient.prototype._createSelfId = function (count) {
        if (count === void 0) { count = 4; }
        var s = [];
        for (var i = 0; i < count; i++) {
            s[i] = "0123456789abcdef".substr(Math.floor(Math.random() * 0x10), 1);
        }
        var s_id = s.join("");
        return s_id;
    };
    return AmqpClient;
}());
exports["default"] = AmqpClient;
