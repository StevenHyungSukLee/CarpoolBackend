const findDriver = require('../models/findDriverModel')
const findPassenger = require('../models/findPassengerModel')
const mongoose = require('mongoose')
const fetch = require("node-fetch");
require('dotenv').config()

// get all rides
const get_requested_rides = async (req, res) => {
    const {max_capacity, driver_current, driver_dest, time_interval} = req.body
    const rides = await findDriver.find({
        $and: [
          { num_of_pass: { $lte: max_capacity } },
          { from: { $lte: time_interval } },
          { to: { $gte: time_interval } },
          { passenger_id: { $nin: [req.user._id] } }
        ]
      }).sort({ createdAt: -1 })
    var max_price_arr = []
    var min_price_arr = []
    var additional_time_array = []

    for( var i = 0; i < rides.length; i++){
        var address1 = rides[i]['pick_up']
        var address2 = rides[i]['destination']
        const price = await getAccuratePriceEstimate(address1, address2)
        max_price_arr.push((price*0.70).toFixed(2))
        min_price_arr.push((price*0.10).toFixed(2))
        const time = await additional_time(driver_current, address1, address2, driver_dest)
        additional_time_array.push(time)
    }
    result = []
    const driver_address = await get_address(driver_current, driver_dest)
    for( var i = 0; i < rides.length; i++){
        result.push({
            'findDriver_id': rides[i]['_id'],
            'pick_up': rides[i]['pick_up'],
            'pass_dest': rides[i]['destination'],
            'driver_current': driver_address[1],
            'driver_dest': driver_address[0],
            'max_price': parseFloat(max_price_arr[i]),
            'min_price': parseFloat(min_price_arr[i]),
            'additional_time': additional_time_array[i]
        })
    }

    

    return res.status(200).json(result)
}

const request_to_pass = async (req, res) => {
    const {findDriver_id, pick_up, pass_dest, driver_current, driver_dest, max_price, min_price, additional_time, price, time_of_pickup} = req.body
    if(price > max_price){
        return res.status(400).json({ error: 'Price request must be less than maximum price'})
    }
    else if(price < min_price){
        return res.status(400).json({ error: 'Price request must be greater than minimum price'})
    }
    const today = new Date()
    const time = await travel_time(driver_current, pick_up)
    today.setMinutes(today.getMinutes() + time)
    const time_when_arrive = (today.getHours()-4) *100 + today.getMinutes()
    if (time_when_arrive + 5 > time_of_pickup){
        return res.status(400).json({ error: 'Your time of arrival must have 5 minutes spare time to the current estimated time of arrival'})
    }
    const arrival_time = new Date()
    const time2 = await travel_time(pick_up, pass_dest)
    const hour = Math.floor(time_of_pickup/100)
    const minute = time_of_pickup%100
    arrival_time.setHours(hour)
    arrival_time.setMinutes(minute)
    arrival_time.setMinutes(arrival_time.getMinutes()+time2)
    const time_of_arrival = (arrival_time.getHours()) *100 + arrival_time.getMinutes()
     

    try {
        const driver_id = req.user._id
        const doc = await findDriver.findOne({_id: findDriver_id})
        const passenger_id = doc.passenger_id
        const requestride = await findPassenger.driver_request(
            passenger_id,
            driver_id,
            price,
            time_of_arrival,
            time_of_pickup,
            pick_up,
            pass_dest,
            additional_time
        )

        return res.status(200).json(requestride)
    } catch (error){

        return res.status(400).json({error: error.message})

    }
}

const get_all_request = async (req, res) => {

    user = req.user

    try{
        const document1 = await findPassenger.find({passenger_id:user._id}).sort({createdAt:-1})
        const document2 = await findPassenger.find({driver_id:user._id}).sort({createdAt:-1})
        if(Object.keys(document2).length == 0){
            return res.status(200).json(document1)
        } else {
            return res.status(200).json(document2)
        }
        
    } catch (error){
        return res.status(400).json({error: error.message})
    }
    

}

const get_num_request = async (req, res) => {

    const {max_capacity,driver_current,driver_dest} = req.body
    const valid_loc = await travel_time(driver_current, driver_dest)
    try{
        if (typeof valid_loc != "number"){
            throw new Error("Not valid address")
        }

        const time_dict = {}
        const time_array = [  "12:00AM - 12:30AM",  "12:30AM - 01:00AM",  "01:00AM - 01:30AM",  "01:30AM - 02:00AM",  
        "02:00AM - 02:30AM",  "02:30AM - 03:00AM",  "03:00AM - 03:30AM",  "03:30AM - 04:00AM",  "04:00AM - 04:30AM",  
        "04:30AM - 05:00AM",  "05:00AM - 05:30AM",  "05:30AM - 06:00AM",  "06:00AM - 06:30AM",  "06:30AM - 07:00AM",  
        "07:00AM - 07:30AM",  "07:30AM - 08:00AM",  "08:00AM - 08:30AM",  "08:30AM - 09:00AM",  "09:00AM - 09:30AM",  
        "09:30AM - 10:00AM",  "10:00AM - 10:30AM",  "10:30AM - 11:00AM",  "11:00AM - 11:30AM",  "11:30AM - 12:00PM",  
        "12:00PM - 12:30PM",  "12:30PM - 01:00PM",  "01:00PM - 01:30PM",  "01:30PM - 02:00PM",  "02:00PM - 02:30PM",  
        "02:30PM - 03:00PM",  "03:00PM - 03:30PM",  "03:30PM - 04:00PM",  "04:00PM - 04:30PM",  "04:30PM - 05:00PM",  
        "05:00PM - 05:30PM",  "05:30PM - 06:00PM",  "06:00PM - 06:30PM",  "06:30PM - 07:00PM",  "07:00PM - 07:30PM",  
        "07:30PM - 08:00PM",  "08:00PM - 08:30PM",  "08:30PM - 09:00PM",  "09:00PM - 09:30PM",  "09:30PM - 10:00PM",  
        "10:00PM - 10:30PM",  "10:30PM - 11:00PM",  "11:00PM - 11:30PM",  "11:30PM - 12:00AM"]

        const document = await findDriver.find({num_of_pass:{$lte:max_capacity}})

        for(let slot of time_array){
            time_dict[slot] = 0;
        }

        const keys = Object.keys(time_dict)

        for(var i = 0; i < document.length; i++){
            const from = document[i]['from']
            const to = document[i]['to']
            const start = Math.floor(from/100)*2 + from%100/30;
            const end = Math.floor(to/100)*2 + to%100/30;
            for(var j = start; j < end; j++){
                const curkey = keys[j]
                time_dict[curkey]++;
            }
        }

        return res.status(200).json(time_dict);
    }
    catch (error){
        return res.status(400).json({"error": error.message})
    }
}

const delete_request = async (req, res) => {
    const {id} = req.params
    const request = await findPassenger.findOneAndDelete({_id:id})

    return res.status(200).json(request)
}

const delete_all_findDriver = async (req, res) => {
    const {user} = req.body
    const request = await findDriver.deleteMany({passenger_id: user})

    return res.status(200).json(request)
}

const delete_all_requests_to_pass = async (req, res) => {
    const {user} = req.body
    const request1 = await findPassenger.deleteMany({passenger_id: user})
    const request2 = await findPassenger.deleteMany({driver_id: user})
    if(Object.keys(request2).length == 0){
        return res.status(200).json(request1)
    } else {
        return res.status(200).json(request2)
    }
}



//Helper functions
async function getPriceEstimate(originLat, originLong, destinationLat, destinationLong){

    const resp = await fetch(`https://www.lyft.com/api/costs?start_lat=${originLat}&start_lng=${originLong}&end_lat=${destinationLat}&end_lng=${destinationLong}`)
    const data = await resp.json();
    const lyftCostEstimate = data.cost_estimates.find(obj => obj.ride_type === 'lyft') 
    const finalCost = lyftCostEstimate.estimated_cost_cents_min/100
    return finalCost
 }

async function getGeocoderData(location) {
    location = location.replace(/#\d+\b/, "")
    const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.API_KEY}`);
    const data = await resp.json();
    try {
        const lat = data.results[0].geometry.location['lat'];
        const lng = data.results[0].geometry.location['lng'];
        const arr = [lat, lng]
        return arr
    } catch(error){
        return error
    }


}

 async function travel_time(origin, destination){
    origin = origin.replace(/#\d+\b/, "")
    destination = destination.replace(/#\d+\b/, "")
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
    try{
        const destination_address = data.destination_addresses[0];
        const origin_address = data.origin_addresses[0];
        return [destination_address, origin_address]
    } catch(error){
        return error
    }
  }

  async function additional_time(start, stopover1, stopover2, end){
    const a = await travel_time(start, stopover1);
    const b = await travel_time(stopover1, stopover2);
    const c = await travel_time(stopover2, end);
    const d = await travel_time(start, end)
    return a+b+c-d;
  }

async function getAccuratePriceEstimate(originAddress, destinationAddress) {


    const oLatLongValues = await getGeocoderData(originAddress);
    const dLatLongValues = await getGeocoderData(destinationAddress);
    oLat = oLatLongValues[0];
    oLong = oLatLongValues[1];
    dLat = dLatLongValues[0];
    dLong = dLatLongValues[1];
    const result = getPriceEstimate(oLat,oLong,dLat,dLong);
    return result

}


module.exports = {
    get_requested_rides,
    request_to_pass,
    delete_request,
    get_all_request,
    get_num_request,
    delete_all_findDriver,
    delete_all_requests_to_pass
}