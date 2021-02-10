export interface Consumer {
    name: string;
    callback: Function;
    options: any;
}
export interface Queue {
    name: string;
    options: any;
}
declare class AmqpClient {
    private _connectionString;
    private _connectionPending;
    private _statusQueueInitialized;
    private _connection;
    private _channel;
    private _queueList;
    private _consumerList;
    private _logPrefix;
    private _selfId;
    private _statusQueue;
    constructor(conn_string?: string, queue_list?: Queue[], consumer_list?: Consumer[]);
    setConnectionString(conn_string: string): void;
    setStatusQueueName(queue_name: string): void;
    addQueue(queue_name: string, options?: any): void;
    addConsumer(queue_name: string, callback: Function, options?: any): void;
    setClientId(clientId: string): void;
    connect(): Promise<void>;
    sendMessage(queue: string, data: any): Promise<void>;
    log(content: any, ...args: any[]): void;
    setLogPrefix(prefix: string): void;
    updateConnectionStatus(): Promise<void>;
    private connectionCallback;
    private channelCallback;
    private _updateClientStatus;
    private _createSelfId;
}
export default AmqpClient;
