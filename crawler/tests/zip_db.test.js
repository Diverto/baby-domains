/* eslint-disable no-undef */
// const fs = require('fs')
const path = require('path')
//const rewire = require('rewire')
// const validator = require('validator')
const convertZipToTxt = require('../src/zip_db_handler').convertZipToTxt


let domainZip
beforeAll(() => {
    domainZip = path.join(__dirname, '..', 'data', 'domains-2019-08-16.zip')
 })


describe('Tests converting zip to text file', () => {
    test('should correctly retrieve existing zip file', async () => {
        await expect(convertZipToTxt(domainZip))
            .resolves.toBe(path.join(__dirname, '..', 'data', 'domain-names.txt'))
    })
})
