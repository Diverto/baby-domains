/**
 * @module crawler
 */
const mongoConnect = require('./db/mongoose').mongoConnect
const mongoClose = require('./db/mongoose').mongoClose
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
        const db = await mongoConnect()
        const html  = await getHtml('http://whoisds.com/newly-registered-domains')
        saveHtmlToFile(html)
        const { writePathZip, dateRegistered } = await fetchZippedDomainFile(html)
        
        console.log(`Writepath: ${writePathZip} | Date registered: ${dateRegistered}`)
        await mongoClose(db)
        return
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        logger.error(`* main: ${error}`)
        return
    }
}()