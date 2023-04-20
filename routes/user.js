const express = require('express')

// controller functions
const {
    loginUser,
    signupUser,
    updateUser,
    sendOTP,
    verifyCode,
    reset_Password,

    // deleteUser
} = require('../controllers/userController')

const router = express.Router()

// login route
router.post("/login", loginUser)

// signup route
router.post("/signup", signupUser)

// update route
router.patch("/update", updateUser)

//send OTP email route
router.post("/sendOTP", sendOTP)

//verify OTP route
router.post("/verifyOTP", verifyCode)

//password reset route
router.post("/resetPassword", reset_Password)


// // delete route
// router.delete("/delete", deleteUser)


module.exports = router