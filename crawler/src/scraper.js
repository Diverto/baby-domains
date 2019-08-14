const fs = require('fs')
const path = require('path')
const request = require('request-promise')
const isHtml = require('is-html')
const validator = require('validator')
const cheerio = require('cheerio')
const keys = require('./keys')

const logger = keys.nodeEnv === 'development' ? 
    require('./logger_dev').logger : require('./logger_prod').logger

/**
 * function for writing zipfile that contains baby domains
 * @param {cheerio|node} $ - cheerio object
 * @returns {Date} Registered date of domains data
 */
const domainRegisteredDate = ($) => {
    try {
        let dateRegistered = $('tbody > tr:nth-child(1) > td:nth-child(1)')
            .text()
            .trim()
            .split(' ')[0]
        if(!validator.isISO8601(dateRegistered)) {
            throw new Error('Invalid date format')
        }
        return new Date(dateRegistered)
    } catch(e) {
        logger.error(e)
    }
}

/**
 * function for writing zipfile that contains baby domains
 * @param {Buffer} zippedBuffer - buffer that contains zipped binary data
 * @param {Date} dateRegistered - parsed registered date from site
 */
const writeDomainsZippedFile =  (zippedBuffer, dateRegistered) => {
    const writePath = path.join(__dirname, '..', 'data', 
        `domains-${dateRegistered.getFullYear()}` + 
        `-${dateRegistered.getMonth()}-${dateRegistered.getUTCDate()}.zip`)
    fs.writeFileSync(writePath, zippedBuffer)
}

/**
 * function for obtaining HTML file for scraping
 * @param {string} url - URL from which we should obtain HTML File
 * @returns {string} HTML file that was obtained
 */
exports.getHtml = async (url) => {
    logger.debug('Executing getHtml function')
    try {
        if (!validator.isURL(url)) {
            throw new TypeError('URL provided is not valid')
        }
        const html = await request.get(url)
        if (!isHtml(html)) {
            throw new TypeError('URL exists but is wrong type')
        }
        return html
    } catch (e) {
        if (e instanceof TypeError) {
            logger.error(`${e}`)
            return ''
        } else {
            logger.error(`${e}`)
            return ''
        }
        
    }
}
    
exports.saveHtmlToFile = (html) => {
    logger.debug('Crawled html file is being saved to test.html...')
    fs.writeFileSync('./tests/test.html', html)
}


/**
 * function saving zipped file that contains baby domains, and 
 * @param {string} url - URL from which we should obtain HTML File
 * @returns {object} Object containing the following structure: {zippedFile:<name>, dateRegistered: <date>}
 */
exports.fetchZippedDomainFile = async (html) => {
    logger.debug('Called fetchZippedDomainFile to obtain domains zip file')
    try {
        if (!isHtml(html)) {
            throw new Error('')
        }
        const $ = cheerio.load(html)
        const dateRegistered = domainRegisteredDate($)
        const downloadUrl = $('table > tbody > tr:nth-child(1) > td:nth-child(4) > a')
            .attr('href')
        if (!validator.isURL(downloadUrl)) {
            throw new Error('cannot parse URL for downloading')
        }
        const options = {
            url: downloadUrl,
            encoding: null
        }
        const zippedBuffer = await request.get(options)
        writeDomainsZippedFile(zippedBuffer, dateRegistered)
    } catch (e) {
        logger.error(`Error fecthing zipped file: ${e}`)
    }
    
    
}



