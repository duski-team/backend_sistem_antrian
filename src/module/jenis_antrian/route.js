const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')

router.post('/register', Controller.register)
router.post('/update', Controller.update)
router.get('/list',Controller.list)
router.get('/detailsById/:id',Controller.detailsById)
router.post('/delete',Controller.delete)
module.exports = router