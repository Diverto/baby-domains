const mongoose = require('mongoose')
const { mongoProtocol, mongoHost, 
    mongoPort, mongoDatabase, mongoUser, mongoPassword} = require('../keys')

const logger = require('../logger')

exports.mongoConnect = async () => {
    logger.debug('* api-creator.mongoose.mongoConnect: Executing mongoConnect function')
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
        logger.info('* api-creator.mongoose.mongoConnect: Connected to mongodb')
        return { db }
    } catch (e) {
        const error = `${e}`.replace(/Error:/gi, '>')
        throw new Error(`* api-creator.mongoose.mongoConnect: ${error}`)
    }
}

exports.mongoClose = async (db) => {
    logger.debug('* api-creator.mongoose.mongoClose: Executing mongoClose function')
    try {
        await db.disconnect()
    } catch (e) {
        const error = `${e}`.replace(/Error:/gi, '>')
        throw new Error(`* api-creator.mongoose.mongoClose: ${error}`)
    }
}
