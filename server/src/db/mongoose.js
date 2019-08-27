const mongoose = require('mongoose')
const keys = require('../keys')

const logger = require('./logger')

exports.mongoConnect = async () => {
    logger.debug('Executing mongoConnect function')
    try {
        let uri = ''
        if (keys.mongoProtocol === 'mongodb') {
            uri = `${keys.mongoProtocol}://${keys.mongoHost}:${keys.mongoPort}/${keys.mongoDatabase}`
        } else {
            uri = `${keys.mongoProtocol}://${keys.mongoUser}:${keys.mongoPassword}@` +
        `${keys.mongoHost}/${keys.mongoDatabase}?retryWrites=true&w=majority`
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify:false
        })
        logger.info('Connected to mongodb')
        return
    } catch (e) {
        const error = `${e}`.replace(/Error:/gi, '>')
        throw new Error(`* mongoConnect: ${error}`)
    }
}
