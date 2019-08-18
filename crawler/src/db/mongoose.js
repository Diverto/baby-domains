const mongoose = require('mongoose')
const keys = require('../keys')

const logger = keys.nodeEnv === 'development' ? 
    require('../logger_dev').logger : require('../logger_prod').logger 

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
        
        const db = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify:false
        })
        logger.info('Connected to mongodb')
        return {
            dbError: undefined,
            db
        }
    } catch (e) {
        logger.error(`function mongoConnect: ${e}`)
        return {
            dbError: e,
            db: undefined
        }
    }
}

exports.mongoClose = async (db) => {
    logger.debug('Executing mongoClose function')
    try {
        await db.disconnect()
    } catch (e) {
        logger.error(`function mongoClose: ${e}`)
    }
}
