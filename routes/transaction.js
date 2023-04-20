const express = require('express')
const {
    post_transaction,
    get_transaction,
    delete_transaction,
    update_transaction
} = require('../controllers/transactionController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all routes
router.use(requireAuth)

//get filtered request
router.get('/', get_transaction)

//post request to passenger
router.post('/', post_transaction)

router.delete('/:id', delete_transaction)

router.patch('/:id', update_transaction)



module.exports = router