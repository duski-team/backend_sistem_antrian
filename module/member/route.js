const Controller = require('./controller')
const router = require('express').Router()


router.get('/cekPasien', Controller.cekPasien)

module.exports = router