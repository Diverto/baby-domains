const mongoose = require('mongoose')

const keys = require('../keys')

const uri = `mongodb+srv://${keys.mongoUser}:${keys.mongoPassword}@
cluster0-1wfrf.gcp.mongodb.net/baby-domains?retryWrites=true&w=majority`

mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify:false
})