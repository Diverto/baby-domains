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
        const { dbError, db } = await mongoConnect()
        if (dbError) {
            throw new Error(dbError)
        }
        const { parseError, html } = await getHtml('http://whoisds.com/newly-registered-domains')
        if (parseError) {
            throw new Error(parseError)
        }
        saveHtmlToFile(html)
        const { zippedDomainError, writePath, dateRegistered } = await fetchZippedDomainFile(html)
        if(zippedDomainError) {
            throw new Error (zippedDomainError)
        }
        console.log(`Writepath: ${writePath} | Date registered: ${dateRegistered}`)
        await mongoClose(db)
        return
    } catch (e) {
        logger.error(`Function main: ${e}`)
        return
    }
}()