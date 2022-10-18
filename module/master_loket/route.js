const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register',authentification, Controller.register)
router.post('/update',authentification, Controller.update)
router.get('/list',Controller.list)
router.get('/detailsById/:id',Controller.detailsById)
router.post('/delete',authentification,Controller.delete)
module.exports = router