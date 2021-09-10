const router = require('express').Router()
const projectController = require('../controllers/project.controller')
const { checkProjectIds } = require('../middleware/project.middleware')

router.post('/addProject', projectController.addProject)
router.put('/updateProject/:id', checkProjectIds,projectController.updateProject)
router.delete('/removeProject/:id', checkProjectIds, projectController.removeProject)
router.get('/getProject/:id', checkProjectIds, projectController.getProject)
router.get('/getAllProjectLight', checkProjectIds, projectController.getAllProjectLight)
router.get('/getAllProjectFull', checkProjectIds, projectController.getAllProjectFull)
router.get('/getPasswordConnection/:id', checkProjectIds, projectController.getPasswordConnection)

router.patch('/addComment/:id', checkProjectIds, projectController.addComment)
router.patch('/updateComment/:id', checkProjectIds, projectController.updateComment)
router.patch('/removeComment/:id', checkProjectIds, projectController.removeComment)
router.get('/getComment/:id',  checkProjectIds,projectController.getComment)
router.get('/getAllComment/:id', checkProjectIds,projectController.getAllComment)

module.exports = router