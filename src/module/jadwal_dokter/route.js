const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', authentification, Controller.register)
router.post('/update', authentification, Controller.update)
router.post('/list',authentification,Controller.list)
router.post('/delete', authentification, Controller.delete)
router.post('/syncJadwal', Controller.syncJadwal)
router.post('/syncJadwalDokter', Controller.syncJadwalDokter)
router.post('/updateJadwalDokter', Controller.updateJadwalDokter)
router.post('/listDokterByTanggalPoli', Controller.listDokterByTanggalPoli)
router.post('/listJadwalByDokterTanggalPoli', Controller.listJadwalByDokterTanggalPoli)
router.post('/listJadwalDokterByPoliId', Controller.listJadwalDokterByPoliId)
router.get('/detailsById/:id', Controller.detailsById)

module.exports = router