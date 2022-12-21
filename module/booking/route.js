const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/registerDenganRM',authentification, Controller.registerDenganRM)
router.post('/update',authentification, Controller.update)
router.post('/list',Controller.list)
// router.post('/delete',authentification,Controller.delete)
module.exports = router