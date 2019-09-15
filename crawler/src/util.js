// const fs = require('fs')
const path = require('path')
const logger = require('./logger')


/**
 * function for generating filename from domain registered date 
 * @param {Date} dateRegistered parsed registered Date
 * @returns {string} - returns the full path with the new filename as a date
 */
exports.dateToFilename = (dateRegistered = '') => {
    try {
        logger.debug('Executing crawler/dateToFilename function')
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

/**
 * function that sends a message to crawlerNotification queue when work is done
 * @param {object} ch - RabbitMQ channel
 */
exports.publishMessage = async ({ channel = {}, exchangeName = '', 
                        routingKey = '', data = '' } = {}) => {
    try {
        logger.debug('Executing crawler/publishMessage function')
        if (routingKey === '' || exchangeName === '' || data === '' || 
            (Object.entries(arguments[0]).length === 0 && 
            arguments[0].constructor === Object)) {
                throw new Error('You cannot omit parameters')
        }
        await channel.publish(exchangeName, routingKey, 
            Buffer.from(JSON.stringify(data), 'utf-8'), { persistent: true })
            
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* api-creator/listenMessages: ${error}`)
    }
}

// const areEqual = (obj1, obj2) => {
//     return Object.keys(obj1).every(key => {
//             return Object.prototype.hasOwnProperty.call(obj2, "key") ?
//                 (typeof obj1[key] === 'object' ?
//                     areEqual(obj1[key], obj2[key]) :
//                 obj1[key] === obj2[key]) :
//                 false

//         }
//     )
// }

exports.pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x)

