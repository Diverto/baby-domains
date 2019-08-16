/* eslint-disable no-undef */
const fs = require('fs')
const cheerio = require('cheerio')
const rewire = require('rewire')
const isHtml = require('is-html')
const validator = require('validator')
const getHtml = require('../src/scraper').getHtml
const logger = require('../src/logger_dev').logger

// using rewire to test private functions
const scraperRewire = rewire('../src/scraper')
const domainRegisteredDate = scraperRewire.__get__('domainRegisteredDate')
const obtainDownloadUrl = scraperRewire.__get__('obtainDownloadUrl')
// const writeDomainsZippedFile = scraperRewire.__get__('writeDomainsZippedFile')
const logMock = jest.fn((...args) => { console.log(`Args are: ${args}`) })



let html
let invDateUrlHtml
// let malformedHtml

beforeAll(() => {
    html = fs.readFileSync('./tests/test.html')
    invDateUrlHtml = fs.readFileSync('./tests/test_invalid_url_and_date.html')
    malformedHtml = fs.readFileSync('./tests/test_malformed.html')
 })
beforeEach(() => {
        jest.spyOn(logger, 'error').mockImplementation(() => {})
        jest.spyOn(logger, 'debug').mockImplementation(() => {})
        scraperRewire.__set__('logger', { error: logMock })
        
    })
afterEach(() => {
    logger.error.mockRestore()
    logger.debug.mockRestore()
    logMock.mockRestore()
})

describe('Tests getHtml responsible for retrieving html file', () => {
    
    test('should correctly retrieve html file', async () => {
        const html = await getHtml('http://whoisds.com/newly-registered-domains')
        expect(isHtml(html)).toBe(true)
    })
    test('should throw exception and return empty string if URL is not HTML file', async () => {
        const html = await getHtml('https://jsonplaceholder.typicode.com/posts')
        expect(logger.error.mock.calls[0][0]).toMatch(/wrong type/)
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(html).toHaveLength(0)
        expect(isHtml(html)).toBe(false)
    })
    test('should throw exception and return empty string if arg is not URL', async () => {
        const html = await getHtml('httx:/whoisds.com/newly-registered-domains')
        expect(logger.error.mock.calls[0][0]).toMatch(/not valid/)
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(html).toHaveLength(0)
        expect(isHtml(html)).toBe(false)
    })
    test('should throw exception and return empty string if arg is not URL', async () => {
        const html = await getHtml('httx:/whoisds.com/newly-registered-domains')
        expect(logger.error.mock.calls[0][0]).toMatch(/not valid/)
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(html).toHaveLength(0)
        expect(isHtml(html)).toBe(false)
    })
})

describe('Suit of tests that check date obtaining function', () => {
    test('Should extract date from legit html', () => {
        $ = cheerio.load(html)
        const { domError, dateRegistered }  = domainRegisteredDate($)
        expect(Object.prototype.toString.call(dateRegistered)).toBe('[object Date]')
        expect(domError).toBeUndefined()
    })
    test('Should throw error if given random string', () => {
        const { domError, dateRegistered } = domainRegisteredDate('random data')
        expect(logMock).toHaveBeenCalledTimes(1)
        expect(logMock.mock.calls[0][0]).toMatch(/not a function/)
        expect(dateRegistered).toBeUndefined()
        expect(Object.prototype.toString.call(domError)).toBe('[object Error]')
    })
    test('Should return an error if malformed date', () => {
        $ = cheerio.load(invDateUrlHtml)
        const { domError, dateRegistered } = domainRegisteredDate($)
        expect(logMock).toHaveBeenCalledTimes(1)
        expect(logMock.mock.calls[0][0]).toMatch(/Invalid date format/)
        expect(dateRegistered).toBeUndefined()
        expect(Object.prototype.toString.call(domError)).toBe('[object Error]')
    })
})

describe('Suit of tests that check URL obtaining function', () => {
    test('Should return valid string that is URL', () => {
        $ = cheerio.load(html)
        const { urlError, downloadUrl } = obtainDownloadUrl($)
        expect(urlError).toBeUndefined()
        expect(typeof downloadUrl).toBe('string')
        expect(validator.isURL(downloadUrl)).toBe(true)
    })
    test('Should throw error if given random string', () => {
        const { urlError, downloadUrl } = obtainDownloadUrl('lfjkdsflkdjlksdkfsd')
        expect(logMock).toHaveBeenCalledTimes(1)
        expect(logMock.mock.calls[0][0]).toMatch(/not a function/)
        expect(downloadUrl).toBeUndefined()
        expect(Object.prototype.toString.call(urlError)).toBe('[object Error]')
    })
    test('Should return an error if malformed URL', () => {
        $ = cheerio.load(invDateUrlHtml)
        const { urlError, downloadUrl } = obtainDownloadUrl($)
        expect(logMock).toHaveBeenCalledTimes(1)
        expect(logMock.mock.calls[0][0]).toMatch(/cannot parse URL/)
        expect(downloadUrl).toBeUndefined()
        expect(Object.prototype.toString.call(urlError)).toBe('[object Error]') 
    })
})