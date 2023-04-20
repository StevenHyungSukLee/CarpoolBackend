const express = require('express')

// controller functions
const {
    getUser,
    getUserInfo


    // deleteUser
} = require('../controllers/getUserController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all routes
router.use(requireAuth)

// login route
router.get("/", getUser)

//
router.post("/", getUserInfo)



module.exports = router