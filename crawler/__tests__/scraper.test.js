/* eslint-disable no-undef */
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const rewire = require('rewire')
const isHtml = require('is-html')
const validator = require('validator')

// using rewire to test private functions
const scraperRewire = rewire('../src/scraper')
const domainRegisteredDate = scraperRewire.__get__('domainRegisteredDate')
const obtainDownloadUrl = scraperRewire.__get__('obtainDownloadUrl')
const writeDomainsZippedFile = scraperRewire.__get__('writeDomainsZippedFile')
const convertZipToTxt = scraperRewire.__get__('convertZipToTxt')
const getHtml = scraperRewire.__get__('getHtml')
// const logMock = jest.fn((...args) => { console.log(`Args are: ${args}`) })



let html
let invDateUrlHtml
let domainString
// let domainZip
// let malformedHtml

beforeAll(() => {
    domainString = path.join(__dirname, '..', 'data', 'domains-2019-08-16')
    // domainZip = path.join(__dirname, '..', 'testdata', 'domains-2019-08-16.zip')
    html = fs.readFileSync('./__tests__/test.html')
    invDateUrlHtml = fs.readFileSync('./__tests__/test_invalid_url_and_date.html')
    // malformedHtml = fs.readFileSync('./__tests__/test_malformed.html')
    // jest.mock('fs')
    // jest.mock('unzipper')
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
        try {
            const options = {
                url: 'dsaldsajkljdsakl',
                encoding: null
            }
            await writeDomainsZippedFile({ options, dateFilename: domainString })
        } catch (err) {
            expect(`${err}`)
            .toMatch(/Cannot parse URL for downloading/)
        }
    })
    test('Should fail if url is not present', async () => {
        try {
            const options = {
                encoding: null
            }
            await expect(writeDomainsZippedFile({ options, dateFilename: domainString }))
        } catch (err) {
            expect(`${err}`)
            .toMatch(/Cannot parse URL for downloading/)
        }
    })
    test('Should fail if fs string is not valid', async () => {
        try {
            const options = {
                url: 'https://www.diverto.hr',
                encoding: null
            }
            await expect(writeDomainsZippedFile({ options, dateFilename: '321,3n12312,n' }))
        } catch (err) {
            expect(`${err}`)
            .toMatch(/Path is not a valid filesystem path/)
        }
    })
    test('Should fail if encoding is wrong', async () => {
        try {
            const options = {
                url: 'https://www.diverto.hr',
                encoding: 'json'
            }
            await expect(writeDomainsZippedFile({ options, dateFilename: domainString }))
        } catch (err) {
            expect(`${err}`)
            .toMatch(/Request should be a binary stream/)
        }
    })
    test('Should fail no encoding is imposed', async () => {
        try {
            const options = {
                url: 'https://www.diverto.hr',
            }
            await expect(writeDomainsZippedFile({ options, dateFilename: domainString }))
        } catch (err) {
            expect(`${err}`)
            .toMatch(/Request should be a binary stream/)
        }
    })
    test('Should fail if filename is missing', async () => {
        try {
            const options = {
                url: 'https://www.diverto.hr',
                encoding: null
            }
            await expect(writeDomainsZippedFile({ options }))
        } catch (err) {
            expect(`${err}`)
            .toMatch(/You cannot omit parameters/)
        }
    })
    test('Should fail if options is missing', async () => {
        try {
            await expect(writeDomainsZippedFile({ dateFilename: domainString }))
        } catch (err) {
            expect(`${err}`)
            .toMatch(/You cannot omit parameters/)
        }
    })
    test('Should fail if all parameters are missing', async () => {
        try {
            await expect(writeDomainsZippedFile())
        } catch (err) {
            expect(`${err}`)
            .toMatch(/You cannot omit parameters/)
        }
    })
})

describe('Tests converting zip to text file', () => {
    test('should fail if random name instead of path', async () => {
        await expect(convertZipToTxt('dsadsadsadasd'))
        .rejects.toMatch(/Path is not a valid filesystem path/)
    })
    test('should fail if arg not a string', async () => {
        await expect(convertZipToTxt(24))
        .rejects.toMatch(/Argument should be string/)
    })
    test('should fail if no args', async () => {
        await expect(convertZipToTxt())
        .rejects.toMatch(/Path is not a valid filesystem path/)
    })
})
