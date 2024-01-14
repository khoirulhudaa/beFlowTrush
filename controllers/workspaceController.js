const workspaceModel = require('../models/workspaceModel')
const crypto = require('crypto')

const createWorkspace = async (req, res) => {
    try {

        const { email, workspace_access, workspace_title, workspace_description } = req.body
        
        const tokenRandom = crypto.randomBytes(5).toString('hex')

        const workspaceInput = {
            workspace_id: tokenRandom,
            workspace_title,
            workspace_description,
            workspace_access,
            email
        }

        const newWorkspace = new workspaceModel(workspaceInput)
        await newWorkspace.save()

        return res.json({ status: 200, message: 'Successfully create workspace!' })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const getWorkSpaceById = async (req, res) => {
    try {  
        
        const { user_id } = req.params

        const workspaceEqual = await workspaceModel.find({ workspace_access: user_id })

        if(workspaceEqual === 0) return res.json({ status: 404, message: 'Workspace not available!' })

        return res.json({ status: 200, message: 'Successfully find workspace!', data: workspaceEqual })
        
    } catch (error) {        
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const removeWorkspace = async (req, res) => {
    try {
        
        const { user_id, workspace_id } = req.body
        
        const equalWorkspace = await workspaceModel.findOne({ workspace_id })
        if(!equalWorkspace) return res.json({ status: 404, message: 'Workspace not found!' })
        
        if(equalWorkspace.workspace_access !== user_id) {
            return res.json({ status: 403, message: 'Not access!' })
        }

        await equalWorkspace.deleteOne()
        return res.json({ status: 200, message: 'Successfully find workspace!', data: equalWorkspace })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const updateWorkspace = async (req, res) => {
    try {

        const { workspace_id, workspace_title, workspace_description } = req.body

        const equalWorkspace = await workspaceModel.findOne({ workspace_id })
        if(!equalWorkspace) return res.json({ status: 404, message: 'Workspace not availabel!' })

        const updateWorkspace = await workspaceModel.findOneAndUpdate(
            { workspace_id },
            { $set: { workspace_title,  workspace_description} },
            { new: true }
        );

        if (!updateWorkspace) {
            return res.json({ status: 500, message: 'Failed update workspace!' });
        }

        return res.json({ status: 200, message: 'Succesfully update workspace!' })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

module.exports = {
    createWorkspace,
    getWorkSpaceById,
    removeWorkspace,
    updateWorkspace
}