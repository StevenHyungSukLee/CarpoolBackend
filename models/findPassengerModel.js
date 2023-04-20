const mongoose = require('mongoose')

const Schema = mongoose.Schema

const findPassengerSchema = new Schema({
    passenger_id: {
        type: String,
        required: true
    },
    driver_id: {
        type: String,
        required: true
    },
    price: {
        type: Number,
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
    }
    
}, { timestamps: true })

findPassengerSchema.statics.driver_request = async function(passenger_id, driver_id, price, time_of_arrival, time_of_pickup, pick_up, pass_dest, additional_time){
    const exists = await this.findOne({passenger_id, driver_id})
    if (exists){
        throw Error('Request already sent')
    }
    const request = await this.create({passenger_id, driver_id, price, time_of_arrival, time_of_pickup, pick_up, pass_dest, additional_time})
    return request
}
module.exports = mongoose.model('findPassenger', findPassengerSchema)

