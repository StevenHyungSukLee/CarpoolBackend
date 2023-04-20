const findDriver = require('../models/findDriverModel')
const findPassenger = require('../models/findPassengerModel')
const transaction = require('../models/transactionModel')
const mongoose = require('mongoose')


const post_transaction = async (req, res) => {
    const {price, driver_id, passenger_id, time_of_arrival, time_of_pickup, pick_up, pass_dest, additional_time} = req.body

    const code = Math.floor(Math.random()*9000)+1000 //generate random 4-digit number
    
    try {
        const trans = await transaction.send_request(
            price, driver_id, passenger_id, time_of_arrival, 
            time_of_pickup, pick_up, pass_dest, additional_time, code)
        return res.status(200).json(trans)
    }
    catch(error){
        return res.status(400).json(error.message)
    }
    

    
}

const get_transaction = async (req, res) => {
    user = req.user
    try{
        const gettrans1 = await transaction.findOne({passenger_id: user._id})
        const gettrans2 = await transaction.findOne({driver_id: user._id})
        if(gettrans1){
            return res.status(200).json(gettrans1)
        }else{
            return res.status(200).json(gettrans2)
        }
    }
    catch(error){
        return res.status(400).json({error: error.message})
    }
}

const delete_transaction = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such request'})
    }

    const request = await transaction.findOneAndDelete({_id: id})

    if (!request) {
        return res.status(400).json({error: 'No such request'})
    }

    return res.status(200).json(request)
}

const update_transaction = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such request'})
    }

    const request = await transaction.findOneAndUpdate({_id:id}, {
        ...req.body
    },{new: true})

    if (!request) {
        return res.status(400).json({error: 'No such request'})
    }

    return res.status(200).json(request)
}

module.exports = {
    post_transaction,
    get_transaction,
    delete_transaction,
    update_transaction
}