const fs = require('fs')
const path = require('path')
const request = require('request-promise')
const isHtml = require('is-html')
const validator = require('validator')
const cheerio = require('cheerio')

/**
 * function for obtaining HTML file for scraping
 * @param {string} url - URL from which we should obtain HTML File
 * @returns {string} HTML file that was obtained
 */
exports.getHtml = async (url) => {
    try {
        if (!validator.isURL(url)) {
            throw new TypeError('URL provided is not valid')
        }
        const html = await request.get(url)
        if (isHtml(html)) {
            return html
        }
        throw new TypeError('URL exists but is wrong type')
        
    } catch (e) {
        if (e instanceof TypeError) {
            console.log(`URL is not a valid html: ${e}`)
            return ''
        } else {
            console.log(`URL is not available: ${e}`)
            return ''
        }
        
    }
}
    
exports.saveHtmlToFile = (html) => {
    fs.writeFileSync('./tests/test.html', html)
    console.log()
}

/**
 * function saving zipped file that contains baby domains, and 
 * @param {string} url - URL from which we should obtain HTML File
 * @returns {object} Object containing the following structure: {zippedFile:<name>, dateRegistered: <date>}
 */
exports.fetchZippedDomainFile = async (html) => {
    try {
        if (!isHtml(html)) {
            throw new Error('')
        }
        const $ = cheerio.load(html)
        let dateRegistered = $('tbody > tr:nth-child(1) > td:nth-child(1)')
            .text()
            .trim()
            .split(' ')[0]
        if(!validator.isISO8601(dateRegistered)) {
            throw new Error('Invalid date')
        }
        dateRegistered = new Date(dateRegistered)
        const downloadUrl = $('table > tbody > tr:nth-child(1) > td:nth-child(4) > a')
            .attr('href')
        const options = {
            url: downloadUrl,
            encoding: null
        }
        const zippedBuffer = await request.get(options)
        const writePath = path.join(__dirname, '..', 'data', 
        `domains-${dateRegistered.getFullYear()}` + 
        `-${dateRegistered.getMonth()}-${dateRegistered.getUTCDate()}.zip`)
        fs.writeFileSync(writePath, zippedBuffer)

    } catch (e) {
        console.log(`Error fecthing zipped file: ${e}`)
    }
    
    
}



