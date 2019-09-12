/**
 * @module api-creator
 */
var CronJob = require('cron').CronJob
const mongoConnect = require('./db/mongoose').mongoConnect
const mongoClose = require('./db/mongoose').mongoClose
const logger = require('./logger')

!async function main() {
    try {
        new CronJob('0 21 * * *', async function() {
            const { db } = await mongoConnect()
           
            await mongoClose(db)
          }, null, true, 'Europe/Vienna', undefined, true);
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        logger.error(`* main: ${error}`)
        process.exit(-1)
    }
}()