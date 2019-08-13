/* eslint-disable no-undef */
// const fs = require('fs')
const isHtml = require('is-html')
const getHtml = require('../src/scraper').getHtml



// beforeAll(() => {
//    const html = fs.readFileSync('./tests/test.html')
// })

describe('Tests getHtml responsible for retrieving html file', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {})
    })
    afterEach(() => {
        console.log.mockRestore();
    })
    test('should correctly retrieve html file', async () => {
        const html = await getHtml('http://whoisds.com/newly-registered-domains')
        expect(isHtml(html)).toBe(true)
    })
    test('should throw exception and return empty string if URL is not HTML file', async () => {
        const html = await getHtml('https://jsonplaceholder.typicode.com/posts')
        expect(console.log.mock.calls[0][0]).toMatch(/wrong type/)
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(html).toHaveLength(0)
        expect(isHtml(html)).toBe(false)
    })
    test('should throw exception and return empty string if arg is not URL', async () => {
        const html = await getHtml('httx:/whoisds.com/newly-registered-domains')
        expect(console.log.mock.calls[0][0]).toMatch(/not valid/)
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(html).toHaveLength(0)
        expect(isHtml(html)).toBe(false)
    })
})

describe('Suit of tests that tries to fetch domain zipped file with corresponding date', () => {
    test('stub', () => {
        expect(true).toBe(true)
    })
})