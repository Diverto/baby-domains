const mongoose = require('mongoose')
const keys = require('../keys')

const logger = keys.nodeEnv === 'development' ? 
    require('../logger_dev').logger : require('../logger_prod').logger 

exports.mongoConnect = async function () {
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
    } catch (e) {
        logger.error(`DB error: ${e}`)
    }
}
