const mongoose = require('mongoose')

const Schema = mongoose.Schema

const transactionSchema = new Schema({
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
        default: false
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    cancel_reason: {
        type: String
    }
    
}, { timestamps: true })

transactionSchema.statics.send_request = async function(price, driver_id, passenger_id, time_of_arrival, time_of_pickup, pick_up, pass_dest, additional_time, code){

    const exists = await this.findOne({driver_id})
    if (exists){
        throw Error('Request already sent')
    }
    try {
        const request = await this.create({passenger_id, driver_id, price, time_of_arrival, time_of_pickup, pick_up, pass_dest, additional_time, code})
        return request
    }catch(error){
        throw new Error(error.message)
    }
    
    
}

module.exports = mongoose.model('transaction', transactionSchema)

