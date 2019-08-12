const mongoConnect = require('./db/mongoose')
// const cheerio = require('cheerio')
// const BabyDomain = require('./models/babydomains')

// ESLint-happy IIFE
!async function () {
    try {
        await mongoConnect()
    } catch (e) {
        console.log(`Couldn't connect to database: ${e}`)
    }
}()

