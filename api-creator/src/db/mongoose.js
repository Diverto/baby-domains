const mongoose = require('mongoose')
const { mongoProtocol, mongoHost, 
    mongoPort, mongoDatabase, mongoUser, mongoPassword} = require('../keys')

const logger = require('../logger')

exports.mongoConnect = async () => {
    logger.debug('Executing mongoConnect function')
    try {
        let uri = ''
        if (mongoProtocol === 'mongodb') {
            uri = `${mongoProtocol}://${mongoHost}:${mongoPort}/${mongoDatabase}`
        } else {
            uri = `${mongoProtocol}://${mongoUser}:${mongoPassword}@` +
        `${mongoHost}/${mongoDatabase}?retryWrites=true&w=majority`
        }
        const db = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify:false
        })
        logger.info('Connected to mongodb')
        return { db }
    } catch (e) {
        const error = `${e}`.replace(/Error:/gi, '>')
        throw new Error(`* mongoConnect: ${error}`)
    }
}

exports.mongoClose = async (db) => {
    logger.debug('Executing mongoClose function')
    try {
        await db.disconnect()
    } catch (e) {
        const error = `${e}`.replace(/Error:/gi, '>')
        throw new Error(`* mongoClose: ${error}`)
    }
}
