const mongoose = require('mongoose')

const Schema = mongoose.Schema

const findDriverSchema = new Schema({
    from: {
        type: Number,
        required: true
    },
    to: {
        type: Number,
        required: true
    },
    pick_up: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    num_of_pass: {
        type: Number,
        required: true
    },
    passenger_id: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('findDriver', findDriverSchema)