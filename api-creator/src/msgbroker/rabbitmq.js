const amqp = require('amqplib')
const { cloudamqpConnectionString, exchangeName, routingKey } = require('../keys')
const logger = require('../logger')

/**
 * function for asserting exchange and queues on RabbitMQ broker
 * @returns {{channel: object}}
 */
exports.brokerSetup = async () => {
    try {
        logger.info('Setting up RabbitMQ Exchanges/Queues');
        // connect to RabbitMQ Instance
        const connection = await amqp.connect(cloudamqpConnectionString);
        // create a channel
        let channel = await connection.createChannel();
        // create exchange
        await channel.assertExchange(exchangeName, 'direct', { durable: true });
        // create queues
        await channel.assertQueue(`${exchangeName}.${routingKey}`, { durable: true });
        // bind queues
        await channel.bindQueue(`${exchangeName}.${routingKey}`, exchangeName, routingKey);
    
        logger.info("api-creator RabbitMQ setup/check completed");
        return { channel }
        // process.exit();
    } catch (e) {
        const error = `${e}`.replace(/Error:/gi, '>')
        throw new Error(`* broker: ${error}`)
    }

}

