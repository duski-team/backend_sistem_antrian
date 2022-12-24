const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/registerLoket',authentification, Controller.registerLoket)
router.post('/registerPoli',authentification, Controller.registerPoli)
// router.post('/update',authentification, Controller.update)
// router.post('/list',Controller.list)
// router.post('/delete',authentification,Controller.delete)
module.exports = router