const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', Controller.register)
router.post('/update',authentification, Controller.update)
router.post('/list',authentification,Controller.list)
// router.get('/detailsById/:id',Controller.detailsById)
// router.post('/delete',authentification,Controller.delete)
module.exports = router