const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')


router.post('/register',Controller.register)
router.post('/registerAPM',Controller.registerAPM)
router.post('/registerAPMBPJS',Controller.registerAPMBPJS)
router.post('/registerSEP',Controller.registerSEP)


module.exports = router