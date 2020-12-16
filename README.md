#amqplib-easy-client

This package is an easy-use wrapper for amqplib client, designed to use with TypeScript. Just set the connection path, add queues and here you go. Package was built for personal use-cases, and did not have a lot of functionality, but it is going to be expanded and improved.

##Basic usage
```
import AmqpClient from "amqplib-easy-client";

const RABBITMQ_CONNECTION = "";

const amqpClient = new AmqpClient();
amqpClient.setConnectionString(RABBITMQ_CONNECTION);
amqpClient.addQueue("Queue1");
amqpClient.addConsumer("Queue1", (msg) => { console.log(msg); }));
amqpClient.connect();
``` 

The count of possible connected queues and consumers was not tested, but you can surely add more of them.

##Testing connection
Client includes basic connection testing, based on sending status messages to a status queue. Status message includes unique, autogenerated ID of the client, and has a following format:
```
{"clientId":"7ad3","dt":"2020-12-16T15:33:55.239Z"}
```
The name of the status queue by default is `"AMQP_CLIENT_STATUS"`. You can redefine it by use `setStatusQueueName` method. Connection check is performed by calling `"updateConnectionStatus"`, the basic way to use is to launch it by interval.
```
amqpClient.setStatusQueueName("PING");

setInterval(() => {
    amqpClient.updateConnectionStatus();
}, 20000);
```

##TODO & Contribution

Everyone who wants to make a contribution are welcome. There is a lot of ways, how to make library more flexible and useful, TODO for some of this things:
- Add tests
- Custom ID, defined by user
- Callbacks for errors
- Stability testing & improvements

.. and anything else, if needed. Just make an issue or participate in discussions 🙂