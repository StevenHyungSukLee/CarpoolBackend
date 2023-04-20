const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserOTPVerificationSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
})
module.exports = mongoose.model('UserOTPVerification', UserOTPVerificationSchema)