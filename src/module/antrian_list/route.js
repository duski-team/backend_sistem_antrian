const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/registerLoket', Controller.registerLoket)
router.post('/registerAntrian', Controller.registerAntrian)
router.post('/update', Controller.update)
router.post('/list',Controller.list)
router.post('/listHalaman',Controller.listHalaman)
router.get('/listAntrianAktif',Controller.listAntrianAktif)
router.post('/listAntrianAktifPoli',Controller.listAntrianAktifPoli)
router.post('/delete',authentification,Controller.delete)
module.exports = router