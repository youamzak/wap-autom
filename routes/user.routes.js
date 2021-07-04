const router = require('express').Router()
const authController = require('../controllers/auth.controller')

// auth 
router.post('/register', authController.signUp)
router.post('/login', authController.signIn)
router.post('/logout', authController.logout)

module.exports = router