const findDriver = require('../models/findDriverModel')
const findPassenger = require('../models/findPassengerModel')
const transaction = require('../models/transactionModel')
const pastRide = require('../models/pastRideModel')
const mongoose = require('mongoose')

const post_pastRides = async (req, res) => {
    const {
        price, driver_id, passenger_id, time_of_arrival, 
        time_of_pickup, pick_up, pass_dest, additional_time, code, 
        isVerified, isCancelled, cancel_reason
    } = req.body

    try {
        const request = await pastRide.create({
            price, driver_id, passenger_id, time_of_arrival, 
            time_of_pickup, pick_up, pass_dest, additional_time, code, isVerified, 
            isCancelled, cancel_reason})
        return res.status(200).json({request})
        
    } catch (error){
        return res.status(400).json({error: error.message})
    }

}

const get_pastRides_passenger = async (req, res) => {
    user = req.user
    try{
        const document = await pastRide.find({passenger_id:user._id}).sort({createdAt:-1})

        return res.status(200).json(document)
        
    } catch (error){
        return res.status(400).json({error: error.message})
    }
}

const get_pastRides_driver = async (req, res) => {
    user = req.user
    try{
        const document = await pastRide.find({driver_id:user._id}).sort({createdAt:-1})

        return res.status(200).json(document)
        
    } catch (error){
        return res.status(400).json({error: error.message})
    }
}


module.exports = {
    post_pastRides,
    get_pastRides_passenger,
    get_pastRides_driver
}