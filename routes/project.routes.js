const router = require('express').Router()
const projectController = require('../controllers/project.controller')

router.post('/addProject', projectController.addProject)
router.put('/updateProject/:id', projectController.updateProject)
router.delete('/removeProject/:id', projectController.removeProject)
router.get('/getProject/:id', projectController.getProject)
router.get('/getAllProject', projectController.getAllProject)
router.get('/getPasswordConnection/:id', projectController.getPasswordConnection)

router.patch('/addComment/:id', projectController.addComment)
router.patch('/updateComment/:id', projectController.updateComment)
router.patch('/removeComment/:id', projectController.removeComment)
router.get('/getComment/:id', projectController.getComment)
router.get('/getAllComment/:id', projectController.getAllComment)

module.exports = router