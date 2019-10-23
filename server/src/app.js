const express = require('express')
const path = require('path')
const mongoConnect = require('./db/mongoose').mongoConnect
// const domainRouter = require('./routers/domains')

const publicDirectoryPath = path.join(__dirname, '../public')

const app = express()

// setup static dir to serve
app.use(express.static(publicDirectoryPath))

app.get('/', (req, res) => {
    res.send('Hi');
  });  

// app.use(domainRouter)

// ESLint-happy IIFE
!async function () {
    try {
        await mongoConnect()
    } catch (e) {
        console.log(`Couldn't connect to database: ${e}`)
    }
}()


module.exports = app