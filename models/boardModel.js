const mongoose = require('mongoose')

const boardModel = new mongoose.Schema({
    workspace_id: {
        type: String,
        required: true
    },
    board_id: {
        type: String,
        required: true
    },
    board_title: {
        type: String,
        required: true
    },
    board_description: {
        type: String,
        default: 'Not description'
    },
    board_access: {
        type: String,
        required: true
    },
    members: {
        type: Array,
        default: []
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('board', boardModel)