const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/registerLoket',authentification, Controller.registerLoket)
router.post('/registerMandiri',authentification, Controller.registerMandiri)
router.post('/update',authentification, Controller.update)
router.post('/list',authentification,Controller.list)
router.post('/listHalaman',authentification,Controller.listHalaman)
// router.post('/delete',authentification,Controller.delete)
module.exports = router