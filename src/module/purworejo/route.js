const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')


router.get('/getDokter',Controller.getDokter)
router.get('/listPoli',Controller.listPoli)
router.get('/jadwalDokter/:dokter_id',Controller.jadwalDokter)
router.get('/rujukan',Controller.rujukan)
router.post('/detailsPasienBPJS',Controller.detailsPasienBPJS)
router.get('/detailsDataKontrol/:noSuratKontrol',Controller.detailsDataKontrol)
router.post('/listRujukan',Controller.listRujukan)
router.post('/getKontrol',Controller.getKontrol)
router.post('/getListRujukInternal',Controller.getListRujukInternal)
router.post('/listHeadline',Controller.listHeadline)

module.exports = router