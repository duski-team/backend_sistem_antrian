const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register',authentification,Controller.register)
router.post('/acceptedPersetujuan',authentification,Controller.acceptedPersetujuan)
router.post('/deleteMember',authentification,Controller.deleteMember)
router.post('/update',authentification,Controller.update)
router.get('/cekPasien/:no', Controller.cekPasien)
router.get('/listMemberByUserId/:user_id', Controller.listMemberByUserId)
router.get('/listMemberBaru', Controller.listMemberBaru)

module.exports = router