const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')


router.get('/getDokter',Controller.getDokter)
router.get('/listPoli',Controller.listPoli)
router.get('/jadwalDokter/:dokter_id',Controller.jadwalDokter)
router.get('/rujukan',Controller.rujukan)

module.exports = router