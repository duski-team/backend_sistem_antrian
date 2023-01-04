const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/registerDenganRM', authentification, Controller.registerDenganRM)
router.post('/registerTanpaRM',  Controller.registerTanpaRM)
router.post('/update', authentification, Controller.update)
router.post('/list', authentification, Controller.list)
router.post('/listBookingByUserId', Controller.listBookingByUserId)
router.get('/detailsBookingByKodeBooking/:kode_booking', Controller.detailsBookingByKodeBooking)
router.post('/listAllBooking', Controller.listAllBooking)
router.get('/listBookingAktif', Controller.listBookingAktif)
router.get('/qr', Controller.qr)
// router.post('/delete',authentification,Controller.delete)
module.exports = router