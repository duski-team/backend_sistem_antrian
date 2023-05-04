const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')


router.get('/getDokter', Controller.getDokter)
router.get('/listPoli', Controller.listPoli)
router.get('/jadwalDokter/:dokter_id', Controller.jadwalDokter)
router.get('/rujukan', Controller.rujukan)
router.post('/detailsPasienBPJS', Controller.detailsPasienBPJS)
router.get('/detailsDataKontrol/:noSuratKontrol', Controller.detailsDataKontrol)
router.post('/listRujukan', Controller.listRujukan)
router.post('/getKontrol', Controller.getKontrol)
router.get('/getListRujukInternal/:noRm', Controller.getListRujukInternal)
router.post('/listHeadline', Controller.listHeadline)
router.get('/getListPekerjaan', Controller.getListPekerjaan)
router.get('/getListProvinsi', Controller.getListProvinsi)
router.post('/getListKota', Controller.getListKota)
router.post('/getListKecamatan', Controller.getListKecamatan)
router.post('/getListKelurahan', Controller.getListKelurahan)
router.post('/createPasienBaru', Controller.createPasienBaru)
router.post('/getFinger', Controller.getFinger)
router.post('/registerAntreanBPJSLoket', Controller.registerAntreanBPJSLoket)
router.post('/createAntrean', Controller.createAntrean)
router.post('/updateAntrean', Controller.updateAntrean)
router.post('/testEmail', Controller.testEmail)
router.post('/cekLibur', Controller.cekLibur)
router.post('/jadawalPerTanggal', Controller.jadawalPerTanggal)

module.exports = router