const mongoose = require('mongoose')
const keys = require('../keys')

const mongoConnect = async function () {
    try {
        let uri = ''
        if (keys.mongoProtocol === 'mongodb') {
            uri = `${keys.mongoProtocol}://${keys.mongoHost}:${keys.mongoPort}/${keys.mongoDatabase}`
        } else {
            uri = `${keys.mongoProtocol}://${keys.mongoUser}:${keys.mongoPassword}@` +
        `${keys.mongoHost}/${keys.mongoDatabase}?retryWrites=true&w=majority`
        }
        
        console.log(uri)
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify:false
        })
        console.log('Connected to mongodb')
    } catch (e) {
        console.log(`DB error: ${e}`)
    }
}

module.exports = mongoConnect