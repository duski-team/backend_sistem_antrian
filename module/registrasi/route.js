const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')


router.post('/register',Controller.register)


module.exports = router