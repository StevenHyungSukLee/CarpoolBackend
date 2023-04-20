const findDriver = require('../models/findDriverModel')
const mongoose = require('mongoose')
const fetch = require("node-fetch");
require('dotenv').config()

// get pending request
const get_pending_ride = async (req, res) => {
    user = req.user
    try {
        const pending_ride = await findDriver.find({ passenger_id: user._id }).sort({createdAt: -1})
        return res.status(200).json(pending_ride)
    }
    catch (error) {
        return res.status(400).json({error: error.message})
    }
}


// request ride
const requestride = async (req, res) => {
    const {from, to, pick_up, destination, num_of_pass} = req.body
    try {

        let emptyFields = []

        if(typeof from != "number"){
            emptyFields.push('from')
            console.log(from)
        }
        if(typeof to != "number"){
            emptyFields.push('to')
        }
        if(!pick_up){
            emptyFields.push('pick_up')
        }
        if(!destination){
            emptyFields.push('destination')
        }
        if(!num_of_pass){
            emptyFields.push('num_of_pass')
        }
        if(emptyFields.length > 0){
            throw new Error('Please fill in all the fields', emptyFields)
        }

        const valid_loc = await travel_time(pick_up, destination)
        if (typeof valid_loc != "number"){
            throw new Error("Not valid address")
        } 
        const address = await get_address(pick_up, destination)
        const passenger_id = req.user._id
        const requestride = await findDriver.create({
            from,
            to,
            pick_up: address[1],
            destination: address[0],
            num_of_pass,
            passenger_id
        })

        return res.status(200).json(requestride)
    } catch (error){
        return res.status(400).json({error: error.message})
    }
}

// delete a request
const deleteRequest = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such request'})
    }

    const request = await findDriver.findOneAndDelete({_id: id})

    if (!request) {
        return res.status(400).json({error: 'No such request'})
    }

    return res.status(200).json(request)
}


// update a request
const updateRequest = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such request'})
    }

    const request = await findDriver.findOneAndUpdate({_id:id},{returnDocument: 'after'}, {
        ...req.body
    })

    if (!request) {
        return res.status(400).json({error: 'No such request'})
    }

    return res.status(200).json(request)
}



async function travel_time(origin, destination){
    const rest = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${process.env.API_KEY}`)
    const data = await rest.json()
    try{
        const distance = data.rows[0].elements[0].distance.text;
        var duration = data.rows[0].elements[0].duration.value;
        return Math.round(duration/60);
    } catch(error){
        return error
    }
  }


async function get_address(origin, destination){
const rest = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${process.env.API_KEY}`)
const data = await rest.json()
console.log(data)
try{
    const destination_address = data.destination_addresses[0];
    const origin_address = data.origin_addresses[0];
    return [destination_address, origin_address]
} catch(error){
    return error
}
}

module.exports = {
    get_pending_ride,
    requestride,
    deleteRequest,
    updateRequest
}