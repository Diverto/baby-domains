const logger = require('./logger')
// const mongoConnect = require('./db/mongoose').mongoConnect
// const mongoClose = require('./db/mongoose').mongoClose

/**
 * function for obtaining URL from parsed HTML
 * @param {object} ch - RabbitMQ channel
 */
exports.listenMessages = async (channel) => {
    try {
        logger.debug('Executing api-creator/listenMessages function')
        await channel.prefetch(1);
        await consume(channel);
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* api-creator/listenMessages: ${error}`)
    }
}

const consume = async(channel) => {
    try {
        logger.debug('Executing api-creator/consume function')
        // const { db } = await mongoConnect()
        channel.consume('babyprocessing.crawlerNotification', async (msg) => {
            if (msg != null) {
                const msgBody = msg.content.toString()
                const data = JSON.parse(msgBody);
                if (data.status === "completed") {
                    logger.debug(`Registered date: ${data.dateRegistered}`)
                }
                await channel.ack(msg);
            }
        })    
        // await mongoClose(db)
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* api-creator/consume: ${error}`)
    }
}