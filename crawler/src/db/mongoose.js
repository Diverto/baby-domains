const mongoose = require('mongoose')
const { mongoProtocol, mongoHost, 
    mongoPort, mongoDatabase, mongoUser, mongoPassword} = require('../keys')

const logger = require('../logger')

exports.mongoConnect = async () => {
    logger.debug('* crawler.mongoose.mongoConnect: Executing mongoConnect function')
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
        console.log(`uri: ${uri}`)
        logger.info('* crawler.mongoose.mongoConnect: Connected to mongodb')
        return { db }
    } catch (e) {
        const error = `${e}`.replace(/Error:/gi, '>')
        throw new Error(`* crawler.mongoose.mongoConnect: ${error}`)
    }
}

exports.mongoClose = async (db) => {
    logger.debug('Executing mongoClose function')
    try {
        await db.disconnect()
    } catch (e) {
        const error = `${e}`.replace(/Error:/gi, '>')
        throw new Error(`* crawler.mongoose.mongoClose: ${error}`)
    }
}
