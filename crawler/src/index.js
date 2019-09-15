/**
 * @module crawler
 */
var CronJob = require('cron').CronJob
const mongoConnect = require('./db/mongoose').mongoConnect
const mongoClose = require('./db/mongoose').mongoClose
const fetchStoreZippedDomainFile = require('./scraper').fetchStoreZippedDomainFile
const parseDomainsAndStore = require('./parseAndStore').parseDomainsAndStore
const logger = require('./logger')
const brokerSetup = require('./msgbroker/rabbitmq').brokerSetup
const { exchangeName, routingKey } = require('./logger')
const publishMessage = require('./util').publishMessage

// ESLint-happy IIFE
!async function main() {
    try {
        new CronJob('0 18 * * *', async function() {
            const { db } = await mongoConnect()
            const { connection, channel } = await brokerSetup()
            const { dateRegistered, dateFilename } = await fetchStoreZippedDomainFile();
            await parseDomainsAndStore({dateRegistered, dateFilename})
            const data = {
                'status': 'completed',
                'dateRegistered': dateRegistered
            }
            await publishMessage( { channel, exchangeName, routingKey, data })
            await channel.close()
            await connection.close()
            await mongoClose(db)
          }, null, true, 'Europe/Vienna', undefined, true);
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        logger.error(`* main: ${error}`)
        process.exit(-1)
    }
}()