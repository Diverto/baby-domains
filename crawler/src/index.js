const mongoConnect = require('./db/mongoose').mongoConnect
const getHtml = require('./scraper').getHtml
const saveHtmlToFile = require('./scraper').saveHtmlToFile
const fetchZippedDomainFile = require('./scraper').fetchZippedDomainFile
// const cheerio = require('cheerio')
// const BabyDomain = require('./models/babydomains')

// ESLint-happy IIFE
!async function main() {
    try {
        await mongoConnect()
    } catch (e) {
        console.log(`Couldn't connect to database: ${e}`)
    }
    const html = await getHtml('http://whoisds.com/newly-registered-domains')
    saveHtmlToFile(html)
    fetchZippedDomainFile(html)

}()