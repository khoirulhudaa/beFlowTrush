const mongoose = require('mongoose')

const workspaceModel = new mongoose.Schema({
    workspace_id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    workspace_title: {
        type: String,
        required: true
    },
    workspace_description: {
        type: String,
        default: 'Not description'
    },
    workspace_access: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('workspace', workspaceModel)