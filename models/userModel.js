const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const  UserVerificationToken= require('../models/UserOTPVerification')
const nodemailer=require('nodemailer')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    isDriver: {
        type: Boolean,
        required: true
    },
    driver_info: {
        car_brand: {
            type: String
        },
        car_model: {
            type: String
        },
        car_color: {
            type: String
        },
        plate_number: {
            type: String
        },
        occupation: {
            type: String
        },
        photo: {
            type: String
        }
    }
})

// static signup method
userSchema.statics.signup = async function(email, first_name, last_name, password, phone_number, isDriver, driver_info) {

    // validation
    if (!email || !password || !first_name || !last_name || !phone_number ){
        throw Error('All fields must be filled')
    }
    if(!email.includes('@emory.edu', -10)) {
        throw Error('Not a valid emory email')
    }
    //minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    if(!validator.isStrongPassword(password)){
        throw Error('Password not strong enough')
    }
    if(!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone_number)){
        throw Error('Not a valid phone number')
    }
    if(isDriver){
        if(!driver_info
            || driver_info.car_brand === ''
            || driver_info.car_model=== ''
            || driver_info.car_color=== ''
            || driver_info.plate_number=== ''
            || driver_info.occupation=== ''){
                throw Error('Driver info field must be filled')
            }
    }


    const exists = await this.findOne({ email })

    if (exists) {
        throw Error('Email already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({ email, password: hash, first_name, last_name, phone_number, isDriver, driver_info})

    return user

}

// static login method
userSchema.statics.login = async function(email, password){
    if (!email || !password){
        throw Error('All fields must be filled')
    }

    const user = await this.findOne({ email })

    if (!user) {
        throw Error('Incorrect email')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match){
        throw Error('Incorrect password')
    }

    return user
}

userSchema.statics.updateUser = async function(email, first_name, last_name, password, phone_number, isDriver, driver_info) {

    // validation
    if (!email || !password || !first_name || !last_name || !phone_number ){
        throw Error('All fields must be filled')
    }
    if(!email.includes('@emory.edu', -10)) {
        throw Error('Not a valid emory email')
    }
    //minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    if(!validator.isStrongPassword(password)){
        throw Error('Password not strong enough')
    }
    if(!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone_number)){
        throw Error('Not a valid phone number')
    }
    if(isDriver){
        if(!driver_info
            || driver_info.car_brand ===null
            || driver_info.car_model===null
            || driver_info.car_color===null 
            || driver_info.plate_number===null 
            || driver_info.occupation===null){
                throw Error('Driver info field must be filled')
            }
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.updateOne({_id: exists._id},{ email, password: hash, first_name, last_name, phone_number, isDriver, driver_info})

    return user

}
userSchema.statics.sendOTPEmail = async function(email){
    if(!email){
        throw Error('Email must be provided')
       }
    if(!email.includes('@emory.edu', -10)) {
        throw Error('Not a valid emory email')
    }
    const user = await this.findOne({ email })
    const val=Math.floor(1000 + Math.random() *9000)
    const otp= `${val}`
    let transporter=nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: 'emorycarpool71@gmail.com',
            pass: 'vqib kjau ebyp eolv'
        }
    })
    const mailOptions={
       from: 'emorycarpool71@gmail.com',
       to: email,
       subject: "Emory carpool- Verify your email",
       html: `<p> Enter <b> ${val} </b>in the app to verify your emory email.</p> <p>This code <b>will expire in 1 hour </b>.</p>`
    };
    const hashedOTP= await bcrypt.hash(otp, 10)
    const verificationToken=new UserVerificationToken({email: email, otp: hashedOTP, createdAt: Date.now(),expiresAt: Date.now() + 3600000
      })
  await verificationToken.save()
  await transporter.sendMail(mailOptions);
  const signup=email
  if(!user){
    return signup
  }
  return user
}
userSchema.statics.verifyOTP = async function(email, otp){
       if(!otp){
        throw Error('OTP must be provided.')
       }
       const user=await this.findOne({ email })
       const verificationRecord= await UserVerificationToken.find({email: email}).limit(1).sort({$natural: -1})
       if(verificationRecord.length<=0){
        throw new Error('Invalid.')
       }
       const expiresAt=verificationRecord[0].expiresAt
       const hashedOTP=verificationRecord[0].otp
       if(expiresAt<Date.now()){
            await UserVerificationToken.deleteMany({email: email})
            throw new Error("Code has already expired. Request a new one.")
       }
       const matchOTP= await bcrypt.compare(otp, hashedOTP)
       if(!matchOTP){
        throw new Error("Invalid code. Try again.")
       }else{
        await UserVerificationToken.deleteMany({email: email})
       }
       const signup=email
    if(!user){
       return signup
    }
       return user
}
userSchema.statics.resetPassword = async function(email, newPassword){
    if(!newPassword){
        throw new Error("New password must be provided.")
    }
    const emailCheck=await this.findOne({email})
    if(!emailCheck){
        throw new Error("This email is not registered. Please signup.")
    }
    //minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    if(!validator.isStrongPassword(newPassword)){
        throw Error('Password not strong enough')
    }
    const filter={email: email}
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(newPassword, salt)
    const update={password:hash}

    const user=await this.findOneAndUpdate(filter, update)
    return user
}
module.exports = mongoose.model('User', userSchema)