const mongoose = require('mongoose')
const validator = require('validator')

const domainSchema = mongoose.Schema({
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

const Domain = mongoose.model('Domain', domainSchema)

module.exports = Domain