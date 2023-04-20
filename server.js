require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')

//

const findDriverRoutes = require ('./routes/findDriver')
const userRoutes = require ('./routes/user')
const findPassengerRoutes = require ('./routes/findPassenger')
const transactionRoutes = require ('./routes/transaction')
const pastRidesRoutes = require ('./routes/pastRides')
const getUserRoutes = require ('./routes/getUser')
//

const app = express()

// middleware

// necessary to access body
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes paths
app.use('/api/findDriver', findDriverRoutes)
app.use('/api/user', userRoutes)
app.use('/api', findPassengerRoutes)
app.use('/api/transaction', transactionRoutes)
app.use('/api/past_rides', pastRidesRoutes)
app.use('/api/user', getUserRoutes)




// connect to mongodb
mongoose.connect(process.env.MONGO_URI).then(() => {
        // listen to request and show port number
        app.listen(process.env.PORT, () => {
            console.log('connected to db & listening on port', process.env.PORT)
        })
    }).catch((error) => {
        console.log(error)
    })




