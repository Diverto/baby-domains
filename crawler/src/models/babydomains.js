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
        validate(value) {
            if(!validator.isISO8601(value)) {
                throw new Error('String is not a date')
            }
        }
    }
}, {
    timestamps: true
})

exports.BabyDomain = mongoose.model('BabyDomain', babyDomainSchema)