const fs = require('fs')
const unzipper = require('unzipper')
// const keys = require('./keys')

exports.convertZipToTxt = (writePathZip) => {
    return new Promise((resolve, reject) => {
        const fileContents = fs.createReadStream(writePathZip)
        const writePath = writePathZip.substring(0, 
            writePathZip.lastIndexOf("/") + 1)
        fileContents.pipe(unzipper.Extract({ path: writePath }))
          .on('close', err => {
            if (err) {
                return reject(err)
            } else {
                resolve(writePath + 'domain-names.txt')
            }
        })
    })
}