const mongoose = require('mongoose')

const keys = require('../keys')

const uri = keys.mongoUri

mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify:false
})