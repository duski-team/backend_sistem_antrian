const Controller = require('./controller')
const router = require('express').Router()
const upload = require('../../helper/upload')
const authentification = require('../../middleware/authentification')

router.post('/register',authentification,upload,Controller.register)
router.post('/acceptedPersetujuan',authentification,Controller.acceptedPersetujuan)
router.post('/deleteMember',authentification,Controller.deleteMember)
router.post('/update',authentification,Controller.update)
router.get('/cekPasien/:no', Controller.cekPasien)
router.get('/listMemberByUserId/:user_id', Controller.listMemberByUserId)
router.get('/listMemberBelumDiverifikasiByUserId/:user_id', Controller.listMemberBelumDiverifikasiByUserId)
router.get('/listMemberDitolakByUserId/:user_id', Controller.listMemberDitolakByUserId)
router.get('/listMemberBaru', Controller.listMemberBaru)
router.get('/detailsById/:id', Controller.detailsById)
router.get('/listAllMember', Controller.detailsById)

module.exports = router