const chalk = require('chalk');
import amqp from "amqplib/callback_api";

export interface Consumer {
    name: string,
    callback: Function,
    options: any
}

export interface Queue {
    name: string,
    options: any
}

export default class AmqpClient {

    private _connectionString: string = "";
    private _connectionPending: Boolean = false;
    private _statusQueueInitialized: Boolean = false;
    private _connection: any = null;
    private _channel: any = null;
    private _queueList: Queue [] = [];
    private _consumerList: Consumer [] = [];
    private _logPrefix: string = "[AMQP_CLIENT]";
    private _selfId?: string;
    private _statusQueue: string = "AMQP_CLIENT_STATUS";

    //Public methods

    constructor(conn_string: string = "", queue_list: Queue [] = [], consumer_list: Consumer [] = []) {
        this._connectionString = conn_string;
        this._queueList = queue_list;
        this._consumerList = consumer_list;
    }   

    setConnectionString(conn_string: string) {
        this._connectionString = conn_string;
    }
    
    setStatusQueueName(queue_name: string) {
        this.addQueue(queue_name);
        this._statusQueueInitialized = true;
        this._statusQueue = queue_name;
    }

    addQueue(queue_name: string, options: any = { durable: false }) {
        this._queueList.push({ name: queue_name, options: options });
    }

    addConsumer(queue_name: string, callback: Function, options: any = { noAck: true }) {
        this._consumerList.push({ name: queue_name, callback: callback, options: options });
    }
    
    setClientId(clientId: string) {
        this._selfId = clientId;
    }

    //Perform a connection with defined queues and consumers
    async connect() {
        if (!this._selfId) {
            this._selfId = this._createSelfId();
        }
        let validate = true;
        if (this._queueList.length == 0) {
            validate = false;
            this.log(chalk.red("[✘]"), "Queue list shouldn't be empty when opening a new connection");
        }
        if (this._consumerList.length == 0) {
            validate = false;
            this.log(chalk.red("[✘]"), "Consumer list shouldn't be empty when opening a new connection");
        }
        if (validate) {
            this._connectionPending = true;
            await amqp.connect(this._connectionString, (err: any, conn: any) => this.connectionCallback(err, conn));
        }
        if (!this._statusQueueInitialized) {
            this.addQueue(this._statusQueue);
        }
    }

    async sendMessage(queue: string, data: any) {
        if (this._connection) {
            try {
                this._channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
            } catch (err) {
                this.log(chalk.red("[✘]"), "Error while sending message");
                this._connection = null;
                this._channel = null;
                this.connect();
            }
        }
    }

    //Redefine this method, if you need to have your own logging
    log(content: any, ...args: any []) {
        console.log(this._logPrefix, content.toString(), ...args);
    }

    setLogPrefix(prefix: string) {
        this._logPrefix = prefix;
    }

    async updateConnectionStatus() {
        this._updateClientStatus();
    }


    //Private methods
    
    private connectionCallback(err: any, conn: any) {
        if (err) {
            this.log(chalk.red("[✘]"), "Connection error: ", err.toString());
        } else {
            this._connection = conn;
            this._connection.createChannel((err: any, channel: any) => this.channelCallback(err, channel));
            this.log(chalk.green("[✔]"), "Connection established!");
            this.log(chalk.blue(`[${chalk.bold("i")}]`), "Client ID is", chalk.yellow(this._selfId));
        }
        this._connectionPending = false;
    }

    //This metod is called, when the connection is received in connect method
    //Each pre-defined queue and consumer are asserted or connected to the channel
    private channelCallback(err: any, channel: any) {
        if (err) {
            this.log(chalk.red("[✘]"), "Error while creating channel", err.toString());
        } else {
            this._channel = channel;
            //Connecting queues defined in list
            this._queueList.forEach((queue: any) => {
                this._channel.assertQueue(queue.name, queue.options);
            });
            //Connecting consumers defined in list
            this._consumerList.forEach((consumer: any) => {
                this._channel.consume(consumer.name, consumer.callback, consumer.options);
            });
        }
    }
    

    private _updateClientStatus() {
        if (this._connection) {
            try {
                this._channel.sendToQueue(this._statusQueue, Buffer.from(JSON.stringify({ clientId: this._selfId, dt: new Date() })));
            } catch (err) {
                this.log(chalk.red("[✘]"), "Connection lost. Reconnecting", err.toString());
                this._connection = null;
                this._channel = null;
                this.connect();
            }
        } else if (!this._connectionPending) {
            this._connection = null;
            this._channel = null;
            this.connect();
        }
    }

    private _createSelfId(count=4) {
        let s = [];
        for (let i = 0; i < count; i++) {
            s[i] = "0123456789abcdef".substr(Math.floor(Math.random() * 0x10), 1);
        }
        let s_id = s.join("");
        return s_id;
    }
}