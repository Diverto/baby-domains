const express = require('express')
const mongoConnect = require('./db/mongoose').mongoConnect
const domainRouter = require('./routers/domains')

const app = express()

app.use(domainRouter)

// ESLint-happy IIFE
!async function () {
    try {
        await mongoConnect()
    } catch (e) {
        console.log(`Couldn't connect to database: ${e}`)
    }
}()


module.exports = app