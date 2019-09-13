/**
 * @module api-creator
 */
const logger = require('./logger')
const brokerSetup = require('./msgbroker/rabbitmq').brokerSetup
const listenMessages = require('./processor').listenMessages

!async function main() {
    try {
        const { ch } = await brokerSetup()
        await listenMessages(ch)
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        logger.error(`* api-creator/main: ${error}`)
        process.exit(-1)
    }
}()