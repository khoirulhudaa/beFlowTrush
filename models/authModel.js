const mongoose = require('mongoose')

const authModel = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    boards: {
        type: Array,
        default: []
    },
    resetTokenPassword: {
        type: String,
        default: '-'
    }
})

module.exports = mongoose.model('auth', authModel)
