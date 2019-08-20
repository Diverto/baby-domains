const fs = require('fs')
const path = require('path')
const rp = require('request-promise')
const request = require('request')
const isHtml = require('is-html')
const validator = require('validator')
const cheerio = require('cheerio')
const keys = require('./keys')

let logger = keys.nodeEnv === 'development' ? 
    require('./logger_dev').logger : require('./logger_prod').logger

/**
 * function for obtaining registered date from 
 * @param {cheerio|node} $ - cheerio object
 * @returns {Date} - Date when domains were registered
 * Anonymous object with domError and dateRegistered members
 */
const domainRegisteredDate = ($) => {
    try {
        const dateRegistered = $('tbody > tr:nth-child(1) > td:nth-child(1)')
        .text()
        .trim()
        .split(' ')[0]
        if(!validator.isISO8601(dateRegistered)) {
            throw new Error('Invalid date format')
        }
        return new Date(dateRegistered)
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* domainRegisteredDate: ${error}`)
    }
    
}

/**
 * function for obtaining URL from parsed HTML
 * @param {cheerio|node} $ - cheerio object
 * @returns {string} - Download URL for zip file
 * Anonymous object with urlError and downloadUrl members
 */
const obtainDownloadUrl = ($) => {
    try {
        logger.debug('Executing obtainDownloadUrl function')
        const downloadUrl = $('table > tbody > tr:nth-child(1) > td:nth-child(4) > a')
            .attr('href')
        if (!validator.isURL(downloadUrl)) {
            throw new Error('cannot parse URL for downloading')
        }
        return downloadUrl
    } catch (e) {
        const error = `${e}`.replace(/^Error:/gi, '>')
        throw new Error(`* obtainDownloadUrl: ${error}`)
    }
}

/**
 * function for writing zipfile that contains baby domains
 * @param {object} options - options for request to obtain binary file
 * @param {Date} dateRegistered - parsed registered date from site
 * @returns {string} - Path where zipped file was stored
 * Anonymous object with writeError and writePath members
 */
const writeDomainsZippedFile = async (options, dateRegistered) => {
    try {
        if((Object.prototype.toString.call(dateRegistered) !== '[object Date]')
            && !validator.isISO8601(dateRegistered)) {
                throw new Error('Invalid date format')
        }
        if(!Object.prototype.hasOwnProperty.call(options, 'encoding') 
            || options.encoding !== null) {
            throw new Error('Request should be a binary stream') 
        }
        if (!validator.isURL(options.url)) {
            throw new Error('cannot parse URL for downloading')
        }
        const writePathZip = path.join(__dirname, '..', 'data', 
            `domains-${dateRegistered.getFullYear()}` + 
            `-${('0' + (dateRegistered.getMonth() + 1)).slice(-2)}` + 
            `-${('0' + dateRegistered.getDate()).slice(-2)}.zip`)
        const writeStream = fs.createWriteStream(writePathZip)
        await request.get(options).pipe(writeStream)
        logger.info(`Zipped file written to: ${writePathZip}`)
        return writePathZip
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* writeDomainsZippedFile: ${error}`)
    }
    
}

/**
 * function for obtaining HTML file for scraping
 * @param {string} url - URL from which we should obtain HTML File
 * @returns {string} = HTML file thatt was parsed
 * Anonymous object with parseError and html members
 */
exports.getHtml = async (url) => {
    logger.debug('Executing getHtml function')
    try {
        if (!validator.isURL(url)) {
            throw new Error('getHtml: URL provided is not valid')
        }
        const html = await rp.get(url)
        if (!isHtml(html)) {
            throw new Error('getHtml: URL exists but is wrong type')
        }
        return html
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* getHtml: ${error}`)
    }
}

/**
 * function for saving HTML file
 * @param {string} html - HTML file to be saved
 */
exports.saveHtmlToFile = (html) => {
    logger.debug('Crawled html file is being saved to test.html...')
    if (!isHtml(html)) {
        throw new Error('saveHtmlToFile: URL exists but is wrong type')
    }
    const writePath = './tests/test.html'
    fs.writeFileSync(writePath, html)
    const result = fs.statSync(writePath)
    if (!result.isFile()) {
        throw new Error(`saveHtmlToFile: couldn't create html file`)
    }
    logger.info(`HTML file written into: ${writePath}`)
}


/**
 * function saving zipped file that contains baby domains, and 
 * @param {string} html - html file that contains link to the zip file
 * @returns {{writePathZip: string, dateRegistered: Date}}
 */
exports.fetchZippedDomainFile = async (html) => {
    logger.debug('Called fetchZippedDomainFile to obtain domains zip file')
    try {
        if (!isHtml(html)) {
            throw new Error('Not a valid HTML file')
        }
        const $ = cheerio.load(html)
        const dateRegistered = domainRegisteredDate($)
        const downloadUrl = obtainDownloadUrl($)
        
        const options = {
            url: downloadUrl,
            encoding: null
        }
        const writePathZip = await writeDomainsZippedFile(options, dateRegistered)
        return {
            writePathZip,
            dateRegistered
        }
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* fetchZippedDomainFile: ${error}`)
    }
}

