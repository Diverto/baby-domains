// var path = require('path');
// var stream = require('stream');
let logger = require('./src/logger_dev').logger

exports.Extract = (opts) => {
    logger.debug(opts)
    // make sure path is normalized before using it
    // opts.path = path.normalize(opts.path)
    
    // let mockedStream = new stream.Writable({objectMode: true})
    // mockedStream._write = (_entry, _encoding, cb) => {
    //     cb()
    // }
    // mockedStream.emit('close')
  
    // return new Promise((resolve, reject) => {
    //   mockedStream.on('close', resolve)
    //   mockedStream.on('error',reject);
    // })
    return new Promise((resolve) => {
        resolve()
    })

}