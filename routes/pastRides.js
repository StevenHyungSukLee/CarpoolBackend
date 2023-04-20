const express = require('express')
const {
    post_pastRides,
    get_pastRides_passenger,
    get_pastRides_driver

} = require('../controllers/pastRidesController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all routes
router.use(requireAuth)

router.get('/passenger/', get_pastRides_passenger)

router.get('/driver/', get_pastRides_driver)

//post request to passenger
router.post('/', post_pastRides)





module.exports = router