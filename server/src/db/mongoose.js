const mongoose = require('mongoose')
const { mongoProtocol, mongoHost, 
    mongoPort, mongoDatabase, mongoUser, mongoPassword} = require('../keys')

const logger = require('../logger')

exports.mongoConnect = async () => {
    logger.debug('* server.mongoose.mongoConnect: starting...')
    try {
        let uri = ''
        if (mongoProtocol === 'mongodb') {
            uri = `${mongoProtocol}://${mongoHost}:${mongoPort}/${mongoDatabase}`
        } else {
            uri = `${mongoProtocol}://${mongoUser}:${mongoPassword}@` +
        `${mongoHost}/${mongoDatabase}?retryWrites=true&w=majority`
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify:false
        })
        logger.info('* server.mongoose.mongoConnect: Connected to mongodb')
        return
    } catch (e) {
        const error = `${e}`.replace(/Error:/gi, '>')
        throw new Error(`* server.mongoose.mongoConnect: ${error}`)
    }
}
