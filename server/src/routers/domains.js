const express = require('express')
// const Domain = require('../models/domains')

const router = new express.Router()

router.get('/domains/all', (res) => {
    res.status(200).send('All right mate')
})

module.exports = router