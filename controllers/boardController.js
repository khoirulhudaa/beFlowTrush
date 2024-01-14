const boardModel = require('../models/boardModel')
const Auth = require('../models/authModel')
const crypto = require('crypto')

const createBoard = async (req, res) => {
    try {
        
        const { workspace_id, board_title, board_description, board_access } = req.body

        const tokenRandom = crypto.randomBytes(6).toString('hex')
        
        const boardInput = {
            workspace_id,
            board_id: tokenRandom,
            board_title,
            board_description,
            board_access        
        }

        const createBoard = new boardModel(boardInput)
        await createBoard.save()

        return res.json({ status: 200, message: 'Successfully create board!' })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const getBoardById = async (req, res) => {
    try {
        
        const { workspace_id, user_id } = req.body

        const equalUser = await Auth.findOne({ user_id })
        if (!equalUser) return res.status(404).json({ status: 404, message: 'User not found!' })

        const equalBoardId = await boardModel.find({ workspace_id })
        
        return res.json({ status: 200, message: 'Successfully find boards!', data: equalBoardId })
    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const getUserInBoard = async (req, res) => {
    try {
        
        const { board_id } = req.params
    
        const equalBoardId = await boardModel.findOne({ board_id })
        if (!equalBoardId) {
            return res.json({ status: 404, message: 'Board not found!' });
        }

        const memberBoard = await Auth.find({ user_id: { $in: equalBoardId.members } });
        const modifiedBoards = memberBoard.map(board => {
            const { boards, password, created_at, resetTokenPassword, ...restOfBoard } = board.toObject();
            return restOfBoard;
        });
        return res.json({ status: 200, message: 'Successfully find members!', data: modifiedBoards })
        
    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const boardInvited = async (req, res) => {
    try {

        const { user_id } = req.params

        const equalUser = await Auth.findOne({ user_id })
        if (!equalUser) return res.status(404).json({ status: 404, message: 'User not found!' })
        
        const resultBoards = await boardModel.find({ members: user_id });
        if (resultBoards === 0) return res.json({ status: 404, message: 'Board not found!' })
        
        const modifiedBoards = resultBoards.map(board => {
            const { board_access, ...restOfBoard } = board.toObject();
            return restOfBoard;
        });

        return res.json({ status: 200, message: 'Successfully find boards!', data: modifiedBoards });
        
    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const removeBoard = async (req, res) => {
    try {
        
        const { user_id, board_id } = req.body
        const removeBoard = await boardModel.findOne({ board_id })

        if(!removeBoard) return res.json({ status: 404, message: 'Board not available!' })
        if(removeBoard.board_access !== user_id) {
            return res.json({ status: 400, message: 'Not access!' })
        }
        
        await removeBoard.deleteOne()
        return res.json({ status: 200, message: 'Successfully remove board!' })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const removeAllBoard = async (req, res) => {
    try {
        
        const { workspace_id } = req.params
        await boardModel.deleteMany({ workspace_id })

        return res.json({ status: 200, message: 'Successfully remove all board!' })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const addMemberBoard = async (req, res) => {
    try {

        const { email, board_id } = req.body
        
        const equalUser = await Auth.findOne({ email })
        if(!equalUser) return res.json({ status: 404, message: 'User not available!' })

        const equalBoard = await boardModel.findOne({ board_id })
        if(!equalBoard) return res.json({ status: 404, message: 'Board not available!' })
        
        if (!equalBoard.members.includes(equalUser.user_id)) {
            equalBoard.members.push(equalUser.user_id)
            await equalBoard.save();
            return res.json({ status: 200, message: 'Successfully add member board!' })
        } else {
            return res.json({ status: 400, message: 'User is already a member of the board!' })
        }

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const removeMemberBoard = async (req, res) => {
    try {

        const { board_id, user_id } = req.body
        
        const board = await boardModel.findOne({ board_id })
        if(!board) return res.json({ status: 404, message: 'Board not available!' })

        board.members = board.members.filter(data => data !== user_id)
        await board.save()

        return res.json({ status: 200, message: 'Successfully left the board!', data: user_id })
        
    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const updateBoard = async (req, res) => {
    try {

        const { board_id, board_title, board_description } = req.body

        const equalBoard = await boardModel.findOne({ board_id })
        if(!equalBoard) return res.json({ status: 404, message: 'Board not availabel!' })

        const updateBoard = await boardModel.findOneAndUpdate(
            { board_id },
            { $set: { board_title,  board_description} },
            { new: true }
        );
            
        if (!updateBoard) {
            return res.json({ status: 500, message: 'Failed update board!' });
        }

        return res.json({ status: 200, message: 'Succesfully update board!' })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

module.exports = {
    createBoard,
    getBoardById,
    removeBoard,
    removeAllBoard,
    addMemberBoard,
    removeMemberBoard,
    boardInvited,
    getUserInBoard,
    updateBoard
}