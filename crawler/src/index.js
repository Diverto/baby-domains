/**
 * @module crawler
 */
const mongoConnect = require('./db/mongoose').mongoConnect
const getHtml = require('./scraper').getHtml
const saveHtmlToFile = require('./scraper').saveHtmlToFile
const fetchZippedDomainFile = require('./scraper').fetchZippedDomainFile
const keys = require('./keys')
// const cheerio = require('cheerio')
// const BabyDomain = require('./models/babydomains')
const logger = keys.nodeEnv === 'development' ? 
    require('./logger_dev').logger : require('./logger_prod').logger 


// ESLint-happy IIFE
!async function main() {
    try {
        await mongoConnect()
    } catch (e) {
        logger.error(`Couldn't connect to database: ${e}`)
    }
    const html = await getHtml('http://whoisds.com/newly-registered-domains')
    saveHtmlToFile(html)
    fetchZippedDomainFile(html)

}()