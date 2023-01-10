const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', Controller.register)
router.post('/registerAdmin', Controller.registerADMIN)
router.post('/verifikasiOTP', Controller.verifikasiOTP)
router.post('/update', authentification, Controller.update)
router.post('/login', Controller.login)
router.get('/list', authentification, Controller.list)
router.post('/listAdmin', authentification, Controller.listAdmin)
router.post('/listByRole', authentification, Controller.listByRole)
router.get('/detailsById/:id', authentification, Controller.detailsById)
router.post('/delete', authentification, Controller.delete)
router.post('/resetPassword', Controller.resetPassword)
router.post('/changePassword', Controller.changePassword)

module.exports = router