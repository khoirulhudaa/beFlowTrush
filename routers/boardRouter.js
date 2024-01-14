const express = require('express')
const router = express.Router()
const boardController = require('../controllers/boardController')

router.post('/', boardController.createBoard)
router.post('/addMember', boardController.addMemberBoard)
router.post('/list', boardController.getBoardById)
router.post('/remove', boardController.removeBoard)
router.delete('/remove/all/:workspace_id', boardController.removeAllBoard)
router.post('/member', boardController.removeMemberBoard)
router.get('/:user_id', boardController.boardInvited)
router.get('/members/:board_id', boardController.getUserInBoard)
router.put('/update', boardController.updateBoard)

module.exports = router