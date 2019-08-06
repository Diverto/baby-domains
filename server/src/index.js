/* eslint-disable no-undef */
const express = require('express')
const domainRouter = require('./routers/domains')

const app = express()

const port = process.env.PORT || 3000

app.use(domainRouter)

app.get('/', (req, res) => {
    res.status(200).send('Hi!')
})

app.listen(port, () => {
    console.log('Server is run on', port)
})