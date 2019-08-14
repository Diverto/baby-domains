/* eslint-disable no-undef */
// const fs = require('fs')
const isHtml = require('is-html')
const getHtml = require('../src/scraper').getHtml
// const fs = require('fs')
// const fetchZippedDomainFile = require('../src/scraper').fetchZippedDomainFile
const logger = require('../src/logger_dev').logger


// beforeAll(() => {
//    const html = fs.readFileSync('./tests/test.html')
// })
beforeEach(() => {
        jest.spyOn(logger, 'error').mockImplementation(() => {})
        jest.spyOn(logger, 'debug').mockImplementation(() => {})
    })
afterEach(() => {
    logger.error.mockRestore();
    logger.debug.mockRestore();
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
})

describe('Suit of tests that tries to fetch domain zipped file with corresponding date', () => {
    test('stub', () => {
        expect(true).toBe(true)
    })
})