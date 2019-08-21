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
const writeDomainsZippedFile = scraperRewire.__get__('writeDomainsZippedFile')
// const writeDomainsZippedFile = scraperRewire.__get__('writeDomainsZippedFile')
// const logMock = jest.fn((...args) => { console.log(`Args are: ${args}`) })



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
        // scraperRewire.__set__('logger', { error: logMock })
        
    })
afterEach(() => {
    logger.error.mockRestore()
    logger.debug.mockRestore()
    // logMock.mockRestore()
})

describe('Tests getHtml responsible for retrieving html file', () => {
    
    test('should correctly retrieve html file', async () => {
        const html  = await getHtml('http://whoisds.com/newly-registered-domains')
        expect(isHtml(html)).toBe(true)
    })
    test('should throw exception if URL is not HTML file', async () => {
        const url = 'https://jsonplaceholder.typicode.com/posts'
        await expect(getHtml(url)).rejects.toThrowError(/wrong type/)
    })
    test('should throw exception if arg is not URL', async () => {
        const url = 'httx:/whoisds.com/newly-registered-domains'
        await expect(getHtml(url)).rejects.toThrowError(/not valid/)
    })
})

describe('Suit of tests that check date obtaining function', () => {
    test('Should extract date from legit html', () => {
        $ = cheerio.load(html)
        const dateRegistered = domainRegisteredDate($)
        expect(Object.prototype.toString.call(dateRegistered)).toBe('[object Date]')
    })
    test('Should throw error if given random string', () => {
        function domainReg() {
            domainRegisteredDate('random data')
        }
        expect(domainReg).toThrowError('not a function');
    })
    test('Should return an error if malformed date', () => {
        function domainReg() {
            $ = cheerio.load(invDateUrlHtml)
            domainRegisteredDate($)
        }
        expect(domainReg).toThrowError(/Invalid date format/)
    })
})

describe('Suit of tests that check URL obtaining function', () => {
    test('Should return valid string that is URL', () => {
        $ = cheerio.load(html)
        downloadUrl = obtainDownloadUrl($)
        expect(typeof downloadUrl).toBe('string')
        expect(validator.isURL(downloadUrl)).toBe(true)
    })
    test('Should throw error if given random string', () => {
        function downUrl () {
            obtainDownloadUrl('lfjkdsflkdjlksdkfsd')
        }
        expect(downUrl).toThrowError(/not a function/)
    })
    test('Should return an error if malformed URL', () => {
        function downUrl () {
            $ = cheerio.load(invDateUrlHtml)
            obtainDownloadUrl($)
        }
        expect(downUrl).toThrowError(/cannot parse URL/)
    })
})

describe('Suit of tests that check writing of domains zipped file', () => {
    test('Should fail if url is not valid', async () => {
        const options = {
            url: 'dsaldsajkljdsakl',
            encoding: null
        }
        await expect(writeDomainsZippedFile(options, '2019-01-01'))
        .rejects.toEqual('* writeDomainsZippedFile: cannot parse URL for downloading')
    })
    test('Should fail if date is not valid', async () => {
        const options = {
            url: 'https://www.diverto.hr',
            encoding: null
        }
        await expect(writeDomainsZippedFile(options, '321,3n12312,n'))
        .rejects.toEqual('* writeDomainsZippedFile: Invalid date format')
    })
    test('Should fail if encoding is wrong', async () => {
        const options = {
            url: 'https://www.diverto.hr',
            encoding: 'json'
        }
        await expect(writeDomainsZippedFile(options, '2019-01-01'))
        .rejects.toEqual('* writeDomainsZippedFile: Request should be a binary stream')
    })
    test('Should fail no encoding is imposed', async () => {
        const options = {
            url: 'https://www.diverto.hr',
        }
        await expect(writeDomainsZippedFile(options, '2019-01-01'))
        .rejects.toEqual('* writeDomainsZippedFile: Request should be a binary stream')
    })
    
})