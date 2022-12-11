const Controller = require('./controller')
const router = require('express').Router()

router.post('/register',Controller.register)
router.post('/update',Controller.update)
router.get('/cekPasien/:NIK', Controller.cekPasien)

module.exports = router