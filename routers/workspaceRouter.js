const express = require('express')
const router = express.Router()
const workspaceController = require('../controllers/workspaceController')

router.post('/', workspaceController.createWorkspace)
router.get('/list/:user_id', workspaceController.getWorkSpaceById)
router.post('/remove', workspaceController.removeWorkspace)
router.put('/update', workspaceController.updateWorkspace)

module.exports = router