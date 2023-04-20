const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '30d' })
}

// login user
const loginUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.login(email, password)

        // create a token
        const token = createToken(user._id)

        return res.status(200).json({email, token})
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
}


// signup user
const signupUser = async (req, res) => {
    const {email, first_name, last_name, password, phone_number, isDriver, driver_info} = req.body


    try {
        const user = await User.signup(email, first_name, last_name, password, phone_number, isDriver, driver_info)

        // create a token
        const token = createToken(user._id)

        return res.status(200).json({email, token})
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
}

const updateUser = async (req, res) => {
    if (!req.body.email){
        return res.status(404).json({error: 'No such request'})
    }

    

    try {
        const user = await User.findOne({email: req.body.email})
        if (req.body.isDriver == false){
            user.isDriver = false
            user.driver_info.car_brand = ''
            user.driver_info.car_model = ''
            user.driver_info.car_color = '' 
            user.driver_info.plate_number = '' 
            user.driver_info.occupation = ''
        }

        if (user) {
            user.first_name = req.body.first_name || user.first_name;

            user.last_name = req.body.last_name || user.last_name;

            user.password = user.password;

            user.phone_number = req.body.phone_number || user.phone_number;

            user.isDriver = req.body.isDriver || user.isDriver;

            user.driver_info = req.body.driver_info || user.driver_info;
            
        } else {
            return res.status(404).json({error: 'No matching email found'})
        }
        
        if(!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(user.phone_number)){
            return res.status(404).json({error: 'Not a valid phone number'})
        }
       
        if(user.isDriver){

            if(!user.driver_info
                || user.driver_info.car_brand === ''
                || user.driver_info.car_model === ''
                || user.driver_info.car_color === '' 
                || user.driver_info.plate_number === '' 
                || user.driver_info.occupation === ''){
                    return res.status(404).json({error: 'Driver information must be filled'})
                }
        }

        if (req.body.password){
            if(!validator.isStrongPassword(req.body.password)){
                return res.status(404).json({error: 'Password not strong enough. (minimum length: 8, minimum lowercase and uppercase: 1, minimum symbols: 1)'})
            }
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(req.body.password, salt)
            user.password = hash
        }
        
        
        const request = await User.findOneAndUpdate({email: req.body.email},{
            email: req.body.email,
            first_name: user.first_name,
            last_name: user.last_name,
            password: user.password,
            phone_number: user.phone_number,
            isDriver: user.isDriver,
            driver_info: user.driver_info
        }
        )
        
        if (!request){
            return res.status(404).json({error: "Couldn't update"})
        }
        // create a token
        const token = createToken(user._id)
        const email = request.email

        return res.status(200).json({email, token})

    } catch (error) {
        return res.status(400).json({error: error.message})
    }
}

const sendOTP = async (req, res) => {
    const {email} = req.body

    try {
         const user = await User.sendOTPEmail(email)
   
        // create a token
        const token = createToken(user._id)
        return res.status(200).json({email, token})
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
}

const verifyCode = async (req, res) => {
    const {email, otp} = req.body

    try {
        const user = await User.verifyOTP(email, otp)
   
        // create a token
        const token = createToken(user._id)
        return res.status(200).json({email, token})
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
}

const reset_Password = async (req, res) => {
    const {email, newPassword} = req.body

    try {
        const user = await User.resetPassword(email, newPassword)
   
        // create a token
        const token = createToken(user._id)
        return res.status(200).json({email, token})
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
}

module.exports = {
    loginUser,
    signupUser,
    updateUser,
    sendOTP,
    verifyCode,
    reset_Password
}