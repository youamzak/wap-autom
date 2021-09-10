const router = require('express').Router()
const projectController = require('../controllers/project.controller')
const { checkProjectIds } = require('../middleware/project.middleware')
const { checkUser } = require("../middleware/auth.middleware");

router.post('/addProject', checkUser,projectController.addProject)
router.put('/updateProject/:id', checkUser,checkProjectIds,projectController.updateProject)
router.delete('/removeProject/:id', checkUser,checkProjectIds, projectController.removeProject)
router.get('/getProject/:id', checkUser,checkProjectIds, projectController.getProject)
router.get('/getAllProjectLight', checkUser,checkProjectIds, projectController.getAllProjectLight)
router.get('/getAllProjectFull', checkUser,checkProjectIds, projectController.getAllProjectFull)
router.get('/getPasswordConnection/:id', checkUser,checkProjectIds, projectController.getPasswordConnection)

router.patch('/addComment/:id', checkUser,checkProjectIds, projectController.addComment)
router.patch('/updateComment/:id', checkUser,checkProjectIds, projectController.updateComment)
router.patch('/removeComment/:id', checkUser,checkProjectIds, projectController.removeComment)
router.get('/getComment/:id',  checkUser,checkProjectIds,projectController.getComment)
router.get('/getAllComment/:id', checkUser, checkProjectIds,projectController.getAllComment)

module.exports = router