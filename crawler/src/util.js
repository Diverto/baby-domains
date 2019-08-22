// const fs = require('fs')
const path = require('path')
// const keys = require('./keys')



/**
 * function for generating filename from domain registered date 
 * @param {Date} dateRegistered parsed registered Date
 * @returns {string} - returns the full path with the new filename as a date
 */
exports.dateToFilename = (dateRegistered = '') => {
    try {
        if (Object.prototype.toString.call(dateRegistered) !== '[object Date]') {
            throw new Error('Invalid type')
        }
        const dateFilename = path.join(__dirname, '..', 'data', 
            `domains-${dateRegistered.getFullYear()}` + 
            `-${('0' + (dateRegistered.getMonth() + 1)).slice(-2)}` + 
            `-${('0' + dateRegistered.getDate()).slice(-2)}`)
        return dateFilename
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* dateToFilename: ${error}`)
    }
}

exports.pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x)