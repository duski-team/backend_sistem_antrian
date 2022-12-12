const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register',authentification,Controller.register)
router.post('/deleteMember',authentification,Controller.deleteMember)
router.post('/update',authentification,Controller.update)
router.get('/cekPasien/:no', Controller.cekPasien)
router.get('/listMemberByUserId/:user_id', Controller.listMemberByUserId)

module.exports = router