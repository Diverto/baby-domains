const logger = require('./logger')
const { exchangeName, routingKey } = require('./keys')
const mongoConnect = require('./db/mongoose').mongoConnect
const mongoClose = require('./db/mongoose').mongoClose
const BabyDomain = require('./models/babydomains').BabyDomain

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
                    const { db } = await mongoConnect()
                    logger.debug(`Processing finished. Registered date: ${data.dateRegistered}`)
                    let upperDate = new Date(data.dateRegistered)
                    upperDate.setDate(upperDate.getDate() + 1)
                    const domains = await BabyDomain.find({'dateRegistered': 
                    {$gte: data.dateRegistered, $lte: upperDate}})
                    logger.info(`Number of entries for ${data.dateRegistered}: 
                    ${Object.keys(domains).length}`)
                    // Object.entries(domains).forEach(([key, value]) => {
                    //     console.log(`${key}: ${value}`);
                    // }) 
                    await mongoClose(db)
                    
                }
            }
        }, {noAck: true})    
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* api-creator/listenMessages: ${error}`)
    }
}
