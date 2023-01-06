const Controller = require('./controller')
const router = require('express').Router()
const authentification = require('../../middleware/authentification')
const upload = require('../../helper/upload')

router.post('/register',authentification, upload,Controller.register)
router.post('/update',authentification,upload, Controller.update)
router.get('/list',Controller.list)
router.get('/detailsById/:id',Controller.detailsById)
router.post('/delete',authentification,Controller.delete)
module.exports = router