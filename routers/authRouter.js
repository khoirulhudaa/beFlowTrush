const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/signUp/user', authController.signUpUser)
router.post('/signIn/user', authController.signInUser)
router.delete('/remove/user/:user_id', authController.removeUser)
router.post('/forgot/password', authController.forgotPassword)
router.post('/reset/password', authController.resetPassword)

module.exports = router


