/**
 * @module crawler
 */
const mongoConnect = require('./db/mongoose').mongoConnect
const mongoClose = require('./db/mongoose').mongoClose
const fetchStoreZippedDomainFile = require('./scraper').fetchStoreZippedDomainFile
const parseDomainsAndStore = require('./parseAndStore').parseDomainsAndStore

const keys = require('./keys')
// const cheerio = require('cheerio')
// const BabyDomain = require('./models/babydomains')
const logger = keys.nodeEnv === 'development' ? 
    require('./logger_dev').logger : require('./logger_prod').logger 


// ESLint-happy IIFE
!async function main() {
    try {
        const db = await mongoConnect()
        
        const { dateRegistered, dateFilename } = await fetchStoreZippedDomainFile()

        await parseDomainsAndStore({dateRegistered, dateFilename})
        
        await mongoClose(db)
        return
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        logger.error(`* main: ${error}`)
        process.exit(-1)
    }
}()