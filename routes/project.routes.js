const router = require('express').Router()
const projectController = require('../controllers/project.controller')

router.post('/addProject', projectController.addProject)
router.post('/updateProject/:id', projectController.updateProject)
router.post('/removeProject/:id', projectController.removeProject)
router.get('/getProject/:id', projectController.getProject)

router.post('/addComment/:id', projectController.addComment)
router.post('/updateComment/:id', projectController.updateComment)
router.post('/removeComment/:id', projectController.removeComment)

router.post('/addBackup', projectController.addBackup)

module.exports = router