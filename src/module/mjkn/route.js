const Controller = require('./controller')
const router = require('express').Router()
const authMjkn = require('../../middleware/authMjkn')

router.post('/ambilAntreanMjkn', authMjkn, Controller.ambilAntreanMjkn)
//router.post('/checkInMjkn', authentification2, Controller.checkInMjkn)
router.get('/loginMjkn', Controller.loginMjkn)

module.exports = router