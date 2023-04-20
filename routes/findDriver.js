const express = require('express')
const {
    get_pending_ride,
    requestride,
    deleteRequest,
    updateRequest
} = require('../controllers/findDriverController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all routes
router.use(requireAuth)

//get all request
router.get('/pending', get_pending_ride)

// POST a new request
router.post('/', requestride)

// DELETE request
router.delete('/:id', deleteRequest)

// UPDATE request
router.patch('/:id', updateRequest)






module.exports = router