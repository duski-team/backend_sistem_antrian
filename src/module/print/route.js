const Controller = require('./controller')
const router = require('express').Router()


router.get('/printAntrian', Controller.printAntrian)
router.get('/printSEP', Controller.printSEP)

module.exports = router