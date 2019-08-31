/**
 * @module crawler
 */
var CronJob = require('cron').CronJob
const mongoConnect = require('./db/mongoose').mongoConnect
const mongoClose = require('./db/mongoose').mongoClose
const fetchStoreZippedDomainFile = require('./scraper').fetchStoreZippedDomainFile
const parseDomainsAndStore = require('./parseAndStore').parseDomainsAndStore
const logger = require('./logger')

// ESLint-happy IIFE
!async function main() {
    try {
        

        new CronJob('0 18 * * *', async function() {
            const { db } = await mongoConnect()
            const { dateRegistered, dateFilename } = await fetchStoreZippedDomainFile();
            await parseDomainsAndStore({dateRegistered, dateFilename})
            await mongoClose(db)
          }, null, true, 'Europe/Vienna', undefined, true);
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        logger.error(`* main: ${error}`)
        process.exit(-1)
    }
}()