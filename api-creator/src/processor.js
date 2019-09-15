const logger = require('./logger')
const { exchangeName, routingKey } = require('./keys')
// const mongoConnect = require('./db/mongoose').mongoConnect
// const mongoClose = require('./db/mongoose').mongoClose

/**
 * function that consumes channel that notifies when crawling
 * and putting domains to db is done
 * @param {object} ch - RabbitMQ channel
 */
exports.listenMessages = async (channel) => {
    try {
        logger.debug('Executing api-creator/listenMessages function')
        await channel.prefetch(1);
        channel.consume(`${exchangeName}.${routingKey}`, async (msg) => {
            if (msg != null) {
                const msgBody = msg.content.toString()
                const data = JSON.parse(msgBody);
                if (data.status === "completed") {
                    logger.debug(`Registered date: ${data.dateRegistered}`)
                }
            }
        }, {noAck: true})    
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* api-creator/listenMessages: ${error}`)
    }
}
