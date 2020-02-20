/**
 * @module api-creator
 */
const logger = require('./logger')
const brokerSetup = require('./msgbroker/rabbitmq').brokerSetup
const listenMessages = require('./processor').listenMessages
const fs = require('fs')
const path = require('path')

!async function main() {
    try {
        const { channel } = await brokerSetup()
        if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'data'))
        }
        await listenMessages(channel)
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        logger.error(`* api-creator.index.main: ${error}`)
        process.exit(-1)
    }
}()