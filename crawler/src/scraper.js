/* eslint-disable require-atomic-updates */
const fs = require('fs')
const fsPromises = fs.promises;
const pEvent = require('p-event');
const path = require('path')
const rp = require('request-promise')
const request = require('request')
const isHtml = require('is-html')
const validator = require('validator')
const cheerio = require('cheerio')
const unzipper = require('unzipper')
const dateToFilename = require('./util').dateToFilename
const logger = require('./logger')

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
        throw new Error(`* crawler.scraper.domainRegisteredDate: ${error}`)
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
        logger.debug('* crawler.scraper.obtainDownloadUrl: starting...')
        const downloadUrl = $('table > tbody > tr:nth-child(1) > td:nth-child(4) > a')
            .attr('href')
        if (!validator.isURL(downloadUrl)) {
            throw new Error('cannot parse URL for downloading')
        }
        return downloadUrl
    } catch (e) {
        const error = `${e}`.replace(/^Error:/gi, '>')
        throw new Error(`* crawler.scraper.obtainDownloadUrl: ${error}`)
    }
}

/**
 * function for writing zipfile that contains baby domains
 * @param {object} options - options for request to obtain binary file
 * @param {Date} dateRegistered - parsed registered date from site
 * @returns {string} - Path where zipped file was stored
 * Anonymous object with writeError and writePath members
 */
const writeDomainsZippedFile = async ({options = {}, dateFilename = ''} = {}) => {
        try {
            if ((!Object.keys(options).length) || dateFilename === '') {
                throw new Error('You cannot omit parameters')
            }
            if(!Object.prototype.hasOwnProperty.call(options, 'encoding') 
                || options.encoding !== null) {
                    throw new Error('Request should be a binary stream') 
            }
            if (!Object.prototype.hasOwnProperty.call(options, 'url') || 
                !validator.isURL(options.url)) {
                throw new Error('Cannot parse URL for downloading')
            }
    
            const pathRel = path.relative(
                path.join(__dirname, '..', 'data'), dateFilename)
            
            if ((pathRel.split("/").length - 1 > 3) || 
                !path.isAbsolute(dateFilename)) {
                throw new Error('Path is not a valid filesystem path')
            }
            // if data folder doesn't exist
            await fsPromises.mkdir(path.dirname(dateFilename), { recursive: true })
            const writePathZip = dateFilename + '.zip'
            const writeStream = fs.createWriteStream(writePathZip)
            let req = request.get(options).pipe(writeStream)
            await pEvent(req, 'close')
            logger.info(`* crawler.scraper.writeDomainsZippedFile: 
            Zipped file written to: ${writePathZip}`)
            return writePathZip
        } catch (e) {
            const error = `${e}`.replace(/^Error:/, '>')
            throw new Error(`* crawler.scraper.writeDomainsZippedFile: ${error}`)
        }
}

/**
 * function for obtaining HTML file for scraping
 * @param {string} url - URL from which we should obtain HTML File
 * @returns {string} = HTML file thatt was parsed
 * Anonymous object with parseError and html members
 */
const getHtml = async (url) => {
    logger.debug('Executing getHtml function')
    try {
        if (!validator.isURL(url)) {
            throw new Error('URL provided is not valid')
        }
        const html = await rp.get(url)
        if (!isHtml(html)) {
            throw new Error('URL exists but is wrong type')
        }
        return html
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* crawler.scraper.getHtml: ${error}`)
    }
}

/**
 * function for saving HTML file
 * @param {string} html - HTML file to be saved
 */
const saveHtmlToFile = (html) => {
    try {
        logger.debug(`* crawler.scraper.saveHtmlToFile: 
        Crawled html file is being saved to test.html...`)
        if (!isHtml(html)) {
            throw new Error('URL exists but is wrong type')
        }
        const writePath = path.join(__dirname, '..', 'testdata','test.html')
        fs.writeFileSync(writePath, html)
        logger.info(`* crawler.scraper.saveHtmlToFile: HTML file written into: ${writePath}`)
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* crawler.scraper.saveHtmlToFile: ${error}`)
    }
}

/**
 * function for obtaining URL from parsed HTML
 * @param {string} writePathZip path to the zip file
 * @returns {Promise} - temporary path of the unzipped txt file if promise is fullfiled
 * Anonymous object with urlError and downloadUrl members
 */
const convertZipToTxt = (writePathZip = '') => {
    return new Promise((resolve, reject) => {
        if (typeof writePathZip !== 'string') {
            return reject('* crawler.scraper.convertZipToTxt: Argument should be string')
        }
        const pathRel = path.relative(
            path.join(__dirname, '..', 'data'), writePathZip)
        
        if ((pathRel.split("/").length - 1 > 3) || 
            !path.isAbsolute(writePathZip)) {
                return reject(`* crawler.scraper.convertZipToTxt: 
                Path is not a valid filesystem path`)
        }
        
        const fileContents = fs.createReadStream(writePathZip)
        let writePathTemp = writePathZip.substring(0, 
            writePathZip.lastIndexOf('/') + 1)
        let res = fileContents.pipe(unzipper.Extract({ path: writePathTemp }))
          .on('close', err => {
            if (err) {
                const error = `${err}`.replace(/^Error:/, '>')
                return reject(`* crawler.scraper.convertZipToTxt: ${error}`)
            } else {
                writePathTemp += 'domain-names.txt'}
                resolve(writePathTemp)
            }
        )
        res.on('error', err => {
            const error = `${err}`.replace(/^Error:/, '>')
            return reject(`* crawler.scraper.convertZipToTxt: ${error}`)
        })
    })
}


/**
 * function saving zipped file that contains baby domains, and 
 * @param {string} html - html file that contains link to the zip file
 * @returns {{writePathZip: string, dateRegistered: Date}}
 */
exports.fetchStoreZippedDomainFile = async () => {
    logger.debug('* crawler.scraper.fetchStoreZippedDomainFile: starting...')
    try {
        const html  = await getHtml('http://whoisds.com/newly-registered-domains')
        saveHtmlToFile(html)
        
        const $ = cheerio.load(html)
        const dateRegistered = domainRegisteredDate($)
        let dateFilename = dateToFilename(dateRegistered)
        const downloadUrl = obtainDownloadUrl($)
        
        const options = {
            url: downloadUrl,
            encoding: null
        }
     
        const writePathZip = await writeDomainsZippedFile({ options, dateFilename })
        logger.info(`* crawler.scraper.fetchStoreZippedDomainFile: 
        writePathZip - ${writePathZip}`)
        const zipFileStats = fs.statSync(writePathZip)
        // if file is smaller than 10kB
        if (zipFileStats.size/1000 < 10) {
            throw new Error(`* crawler.scraper.fetchStoreZippedDomainFile: 
            File is probably empty or corrupted!`)
        }
        const writePathTemp = await convertZipToTxt(writePathZip)
        dateFilename += '.txt'
        fs.renameSync(writePathTemp, dateFilename)
        return { dateRegistered, dateFilename }
        
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* crawler.scraper.fetchStoreZippedDomainFile: ${error}`)
    }
}

