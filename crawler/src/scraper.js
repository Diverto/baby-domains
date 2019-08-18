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
 * @returns {{domError: Error, dateRegistered: Date}}
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
        return { 
            domError: undefined,
            dateRegistered: new Date(dateRegistered)
        }
    } catch(e) {
        logger.error(`Function domainRegisteredDate: ${e}`)
        return {
            domError: e,
            dateRegistered: undefined
        }
    }
}

/**
 * function for obtaining URL from parsed HTML
 * @param {cheerio|node} $ - cheerio object
 * @returns {{urlError: Error, downloadUrl: string}}
 * Anonymous object with urlError and downloadUrl members
 */
const obtainDownloadUrl = ($) => {
    try {
        const downloadUrl = $('table > tbody > tr:nth-child(1) > td:nth-child(4) > a')
            .attr('href')
        if (!validator.isURL(downloadUrl)) {
            throw new Error('cannot parse URL for downloading')
        }
        return {
            urlError: undefined,
            downloadUrl
        }
    } catch (e) {
        logger.error(`Function obtainDownloadUrl: ${e}`)
        return {
            urlError: e,
            downloadUrl: undefined
        }
    }
    
}

/**
 * function for writing zipfile that contains baby domains
 * @param {object} options - options for request to obtain binary file
 * @param {Date} dateRegistered - parsed registered date from site
 * @returns {{writeError: Error, writePath: string}}
 * Anonymous object with writeError and writePath members
 */
const writeDomainsZippedFile = async (options, dateRegistered) => {
    try {
        const writePath = path.join(__dirname, '..', 'data', 
            `domains-${dateRegistered.getFullYear()}` + 
            `-${dateRegistered.getMonth() + 1}-${dateRegistered.getUTCDate()}.zip`)
        const writeStream = fs.createWriteStream(writePath)
        await request.get(options).pipe(writeStream)
        logger.info(`Zipped file written to: ${writePath}`)
        return {
            writeError: undefined,
            writePath
        }
    } catch (e) {
        logger.error(e)
        return {
            writeError: e,
            writePath: undefined
        }
    }
    
}

/**
 * function for obtaining HTML file for scraping
 * @param {string} url - URL from which we should obtain HTML File
 * @returns {{parseError: Error, html: string}}
 * Anonymous object with parseError and html members
 */
exports.getHtml = async (url) => {
    logger.debug('Executing getHtml function')
    try {
        if (!validator.isURL(url)) {
            throw new TypeError('URL provided is not valid')
        }
        const html = await rp.get(url)
        if (!isHtml(html)) {
            throw new TypeError('URL exists but is wrong type')
        }
        return {
            parseError: undefined,
            html
        }
    } catch (e) {
        logger.error(`Function getHtml: ${e}`)
        return {
            parseError: e,
            html: undefined
        }
    }
}

/**
 * function for saving HTML file
 * @param {string} html - HTML file to be saved
 */
exports.saveHtmlToFile = (html) => {
    try {
        logger.debug('Crawled html file is being saved to test.html...')
        const writePath = './tests/test.html'
        fs.writeFileSync(writePath, html)
        logger.info(`HTML file written into: ${writePath}`)
    } catch (e) {
        logger.error(`Function saveHtmlToFile: ${e}`)
        return
    }
    
}


/**
 * function saving zipped file that contains baby domains, and 
 * @param {string} url - URL from which we should obtain HTML File
 * @returns {{fetchZipError: Error, writePath: string}}
 */
exports.fetchZippedDomainFile = async (html) => {
    logger.debug('Called fetchZippedDomainFile to obtain domains zip file')
    try {
        if (!isHtml(html)) {
            throw new Error('Not a valid HTML file')
        }
        const $ = cheerio.load(html)
        const { domError, dateRegistered } = domainRegisteredDate($)
        if (domError) {
            throw new Error(domError)
        }
        const { urlError, downloadUrl } = obtainDownloadUrl($)
        if (urlError) {
            throw new Error(urlError)
        }
        const options = {
            url: downloadUrl,
            encoding: null
        }
        const { writeError, writePath } = await writeDomainsZippedFile(options, dateRegistered)
        if (writeError) {
            throw new Error(writeError)
        }
        return {
            zippedDomainError: undefined,
            writePath,
            dateRegistered
        }
    } catch (e) {
        logger.error(`Function fetchZippedDomainFile: ${e}`)
        return {
            zippedDomainError: e,
            writePath: undefined,
            dateRegistered: undefined
        }
    }
}

