const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register',authentification,Controller.register)
router.post('/update',authentification,Controller.update)
router.get('/cekPasien/:NIK', Controller.cekPasien)

module.exports = router