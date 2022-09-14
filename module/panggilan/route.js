const Controller = require('./controller')
const router = require('express').Router()


router.get('/testing', Controller.testing)

module.exports = router