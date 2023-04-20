const mongoose = require('mongoose')

const Schema = mongoose.Schema

const pastRideSchema = new Schema({
    price: {
        type: Number,
        required: true
    },
    driver_id: {
        type: String,
        required: true
    },
    passenger_id: {
        type: String,
        required: true
    },
    time_of_arrival: {
        type: Number,
        required: true
    },
    time_of_pickup: {
        type: Number,
        required: true
    },
    pick_up: {
        type: String,
        required: true
    },
    pass_dest: {
        type: String,
        required: true
    },
    additional_time: {
        type: String,
        required: true
    },
    code: {
        type: Number,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true
    },
    isCancelled: {
        type: Boolean,
        required: true
    },
    cancel_reason: {
        type: String
    }
    
}, { timestamps: true })

module.exports = mongoose.model('pastRide', pastRideSchema)