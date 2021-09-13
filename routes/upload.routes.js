const router = require('express').Router()
const upload = require('../middleware/upload.middleware')
const uploadController = require('../controllers/upload.controller')
const { checkProjectIds } = require('../middleware/project.middleware')

router.post('/single/:id',checkProjectIds, upload.single('upload'), uploadController.single)
router.post('/multiple/:id',checkProjectIds, upload.array('uploads', 5), uploadController.multiple)
router.delete('/remove/:id',checkProjectIds,  uploadController.remove)
router.get('/getFiles/:id',checkProjectIds,  uploadController.getFiles)

module.exports = router