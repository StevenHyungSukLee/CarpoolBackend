const express = require('express')
const {
    get_requested_rides,
    request_to_pass,
    delete_request,
    get_all_request,
    get_num_request,
    delete_all_findDriver,
    delete_all_requests_to_pass
} = require('../controllers/findPassengerController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all routes
router.use(requireAuth)

//get filtered request
router.post('/findDriver/get/', get_requested_rides)

//post request to passenger
router.post('/requests_to_pass/', request_to_pass)

router.delete('/requests_to_pass/:id', delete_request)

router.get('/requests_to_pass/', get_all_request)

router.post('/findDriver/count/', get_num_request)

router.post('/findDriver/delete/', delete_all_findDriver)

router.post('/requests_to_pass/delete/', delete_all_requests_to_pass)






module.exports = router