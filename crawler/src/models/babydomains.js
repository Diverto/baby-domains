const mongoose = require('mongoose')
const validator = require('validator')

const babyDomainSchema = mongoose.Schema({
    domainName: {
        type: String,
        required: true, 
        trim: true,
        validate(value) {
            if(!validator.isFQDN(value)) {
                throw new Error('Domain is not valid')
            }
        } 
    }
}, {
    timestamps: true
})

const BabyDomain = mongoose.model('BabyDomain', babyDomainSchema)

module.exports = BabyDomain