/* eslint-disable no-undef */
const fs = require('fs')
const path = require('path')
const unzipper = require('unzipper')
//const rewire = require('rewire')
// const validator = require('validator')
const convertZipToTxt = require('../src/zip_db_handler').convertZipToTxt
const logger = require('../src/logger_dev').logger


let domainZip
beforeAll(() => {
    domainZip = path.join(__dirname, '..', 'testdata', 'domains-2019-08-16.zip')
    jest.mock('fs')
 })


describe('Tests converting zip to text file', () => {
    test('should correctly retrieve existing zip file', async () => {
        try {
            expect(convertZipToTxt(domainZip))
            expect(fs.createReadStream).toHaveBeenCalled()
            expect(unzipper.Extract).toHaveBeenCalled()
        } catch (err) {
            logger.error(err)
        }
    })
})
