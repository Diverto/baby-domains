const fs = require('fs')
const path = require('path')
const rp = require('request-promise')
const request = require('request')
const isHtml = require('is-html')
const validator = require('validator')
const cheerio = require('cheerio')
const unzipper = require('unzipper')
const keys = require('./keys')
const dateToFilename = require('./util').dateToFilename

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
const writeDomainsZippedFile = async ({options = {}, dateFilename = ''} = {}) => {
        return new Promise((resolve, reject) => {
            if ((!Object.keys(options).length) || dateFilename === '') {
                return reject('* writeDomainsZippedFile: You cannot omit parameters')
            }
            if(!Object.prototype.hasOwnProperty.call(options, 'encoding') 
                || options.encoding !== null) {
                    return reject('* writeDomainsZippedFile: Request should be a binary stream') 
            }
            if (!Object.prototype.hasOwnProperty.call(options, 'url') || 
                !validator.isURL(options.url)) {
                return reject('* writeDomainsZippedFile: cannot parse URL for downloading')
            }
            try {
                const pathRel = path.relative(
                    path.join(__dirname, '..', 'data'), dateFilename)
                
                if ((pathRel.split("/").length - 1 > 3) || 
                    !path.isAbsolute(dateFilename)) {
                    throw new Error('Path is not a valid filesystem path')
                }
            } catch (e) {
                const error = `${e}`.replace(/^Error:/, '>')
                return reject(`* writeDomainsZippedFile: ${error}`)
            }
            
            
            const writePathZip = dateFilename + '.zip'
            const writeStream = fs.createWriteStream(writePathZip)
            let req = request.get(options).pipe(writeStream)
            req.on('close', err => {
                if (err) {
                    return reject(`* writeDomainsZippedFile: ${err}`)
                } else {
                    logger.info(`Zipped file written to: ${writePathZip}`)
                    resolve(writePathZip)
                }
            })   
        })
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
        throw new Error(`* getHtml: ${error}`)
    }
}

/**
 * function for saving HTML file
 * @param {string} html - HTML file to be saved
 */
const saveHtmlToFile = (html) => {
    try {
        logger.debug('Crawled html file is being saved to test.html...')
        if (!isHtml(html)) {
            throw new Error('saveHtmlToFile: URL exists but is wrong type')
        }
        const writePath = './tests/test.html'
        fs.writeFileSync(writePath, html)
        logger.info(`HTML file written into: ${writePath}`)
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* fetchStoreZippedDomainFile: ${error}`)
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
            return reject('* convertZipToTxt: Argument should be string')
        }
        const pathRel = path.relative(
            path.join(__dirname, '..', 'data'), writePathZip)
        
        if ((pathRel.split("/").length - 1 > 3) || 
            !path.isAbsolute(writePathZip)) {
                return reject('* convertZipToTxt: Path is not a valid filesystem path')
        }
        
        const fileContents = fs.createReadStream(writePathZip)
        let writePathTemp = writePathZip.substring(0, 
            writePathZip.lastIndexOf('/') + 1)
        let res = fileContents.pipe(unzipper.Extract({ path: writePathTemp }))
          .on('close', err => {
            if (err) {
                const error = `${err}`.replace(/^Error:/, '>')
                return reject(`* convertZipToTxt: ${error}`)
            } else {
                writePathTemp += 'domain-names.txt'}
                resolve(writePathTemp)
            }
        )
        res.on('error', err => {
            const error = `${err}`.replace(/^Error:/, '>')
            return reject(`* convertZipToTxt: ${error}`)
        })
    })
}


/**
 * function saving zipped file that contains baby domains, and 
 * @param {string} html - html file that contains link to the zip file
 * @returns {{writePathZip: string, dateRegistered: Date}}
 */
exports.fetchStoreZippedDomainFile = async () => {
    logger.debug('Called fetchZippedDomainFile to obtain domains zip file')
    try {
        const html  = await getHtml('http://whoisds.com/newly-registered-domains')
        saveHtmlToFile(html)
        
        const $ = cheerio.load(html)
        const dateRegistered = domainRegisteredDate($)
        const dateFilename = dateToFilename(dateRegistered)
        const downloadUrl = obtainDownloadUrl($)
        
        const options = {
            url: downloadUrl,
            encoding: null
        }
        const writePathZip = await writeDomainsZippedFile({ options, dateFilename })
        const writePathTemp = await convertZipToTxt(writePathZip)
        fs.renameSync(writePathTemp, dateFilename + '.txt')
        
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* fetchStoreZippedDomainFile: ${error}`)
    }
}

