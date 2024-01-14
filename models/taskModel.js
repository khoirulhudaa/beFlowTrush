const mongoose = require('mongoose')

const taskModel = new mongoose.Schema({
    workspace_id: {
        type: String,
        required: true  
    },
    board_id: {
        type: String,
        required: true
    },
    task_id: {
        type: String,
        required: true
    },
    task_title: {
        type: String,
        required: true
    },
    task_description: {
        type: String,
        default: 'Not description'
    },
    type_task: {
        type: String,
        default: 'doingTo'
    },
    attachment: {
        type: String,
        default: '-'
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('task', taskModel)