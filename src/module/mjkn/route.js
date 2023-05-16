const Controller = require('./controller')
const router = require('express').Router()
const authMjkn = require('../../middleware/authMjkn')

router.post('/ambilAntreanMjkn', authMjkn, Controller.ambilAntreanMjkn)
router.post('/checkinMjkn', authMjkn, Controller.checkinMjkn)
router.post('/statusAntreanMjkn', authMjkn, Controller.statusAntreanMjkn)
router.post('/sisaAntreanMjkn', authMjkn, Controller.sisaAntreanMjkn)
router.post('/batalAntreanMjkn', authMjkn, Controller.batalAntreanMjkn)
router.post('/newPasienMjkn', authMjkn, Controller.newPasienMjkn)
router.post('/kodeOperasiMjkn', authMjkn, Controller.kodeOperasiMjkn)
router.post('/jadwalOperasiMjkn', authMjkn, Controller.jadwalOperasiMjkn)
router.get('/loginMjkn', Controller.loginMjkn)

module.exports = router