const router = require('express').Router()
const authController = require('../controllers/auth.controller')

// auth 
router.post('/signUp', authController.signUp)
router.post('/signIn', authController.signIn)
router.post('/signOut', authController.signOut)

module.exports = router