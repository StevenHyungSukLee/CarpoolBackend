const User = require('../models/userModel')
const mongoose = require('mongoose')

const getUser = async (req, res) => {
    user = req.user
    try {
        const request = await User.findOne({_id : user._id})
        return res.status(200).json({request})
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
}

const getUserInfo = async (req, res) => {
    const id = req.body.id
    try {
        const request = await User.findById(id)
        return res.status(200).json(request)

    }catch (error){
        return res.status(400).json({error: error.message})
    }
}



module.exports = {
    getUser,
    getUserInfo
}