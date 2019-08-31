/* eslint-disable no-undef */
// const fs = require('fs')
const dateToFilename = require('../src/util').dateToFilename


beforeAll(() => {
    // jest.mock('fs')
 })


describe('Tests conversion of registered date to filename path', () => {
    test('Throw error if no args', () => {
        function dateToFn() {
            dateToFilename()
        }
        expect(dateToFn).toThrowError(/Invalid type/)
    })
    test('Throw error if not a date', () => {
        function dateToFn() {
            dateToFilename('dsaasdsadas')
        }
        expect(dateToFn).toThrowError(/Invalid type/)
    })
    test('Throw error if not a date', () => {
        function dateToFn() {
            dateToFilename(14)
        }
        expect(dateToFn).toThrowError(/Invalid type/)
    })
    test('Throw error if not a date', () => {
        function dateToFn() {
            dateToFilename({date: new Date('2019-01-01')})
        }
        expect(dateToFn).toThrowError(/Invalid type/)
    })
    test('Returns a string if valid input', () => {
        expect(dateToFilename(new Date('2019-01-01'))).toMatch(/domains-2019-01-01/)
    })
})
