const express = require('express')
const router = express.Router()
const taskController = require('../controllers/taskController')
const multer = require('multer')
const upload = multer();

router.post('/', upload.single('file_task') , taskController.createTask)
router.get('/list/:board_id', taskController.getTaskById)
router.put('/move/:task_id', taskController.moveTask)
router.put('/:task_id', taskController.updateTask)
router.delete('/:task_id', taskController.removeTask)
router.delete('/remove/all/:workspace_id', taskController.removeAllTask)
router.post('/update', upload.single('file_task') , taskController.updateTaskDetail)

module.exports = router