const mongoose = require('mongoose')
const validator = require('validator')

const babyDomainSchema = mongoose.Schema({
    domainName: {
        type: String,
        required: true, 
        trim: true,
        index: true,
        validate(value) {
            if(!validator.isFQDN(value)) {
                throw new Error('Domain is not valid')
            }
        } 
    },
    dateRegistered: {
        type: Date,
        required: true,
        index: true,
    }
}, {
    timestamps: true
})

exports.BabyDomain = mongoose.model('BabyDomain', babyDomainSchema)