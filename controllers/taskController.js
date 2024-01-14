const mongoose = require('mongoose')
const taskModel = require('../models/taskModel')
const crypto = require('crypto')
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET
});

const createTask = async (req, res) => {
    try {
        
        const { task_title, task_description, board_id, workspace_id } = req.body

        let attachment = null;  
        let attachmentName = null;  
        if(req.file) {
            console.log(req.file.originalname)
        }

        if (req.file) {
            const originalName = req.file.originalname;
            const randomChars = crypto.randomBytes(4).toString('hex');
            attachment = `${randomChars}_${originalName}`;
         
            cloudinary.uploader.upload_stream({ public_id: attachment }, (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                } else {
                    console.log('cloud result:', result);
                    attachmentName = result.secure_url;
                }
            }).end(req.file.buffer);
          
         } else {
            attachment = null
         }

        const tokenRandom = crypto.randomBytes(6).toString('hex')

        const taskInput = {
            task_id: tokenRandom,
            task_title,
            task_description,
            board_id,
            attachment: attachmentName,
            workspace_id
        }

        const createTask = new taskModel(taskInput)
        await createTask.save()
        console.log(22)
        return res.json({ status: 200, message: 'Successfully create task!' })
        
    } catch (error) {
        return res.json({ status: 500, message: 'Failed to create task!', error: error });
    }
}

const getTaskById = async (req, res) => {
    try {
        
        const { board_id } = req.params
        const equalTask = await taskModel.find({ board_id })

        if(equalTask === 0) return res.json({ status: 200, message: 'Task not available!' })

        return res.json({ status: 200, message: 'Successfully get all task!', data: equalTask })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error });
    }
}

const removeTask = async (req, res) => {
    try {

        const { task_id } = req.params
        const equalTask = await taskModel.findOneAndDelete({ task_id })
        
        if(!equalTask) return res.json({ statu: 500, message: 'Failed remove task!' })
        
        await cloudinary.uploader.destroy(equalTask.attachment);
        return res.json({ status: 200, message: 'Successfully remove task!' })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error });
    }
}

const removeAllTask = async (req, res) => {
    try {
        
        const { workspace_id } = req.params
        await taskModel.deleteMany({ workspace_id })

        return res.json({ status: 200, message: 'Successfully remove all task!' })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const moveTask = async (req, res) => {
    try {
        const { task_id } = req.params;
        const { type_task } = req.body;
        console.log(task_id, type_task);

        const updateTask = await taskModel.findOneAndUpdate(
            { task_id },
            { $set: { type_task } },
            { new: true }
        );

        if (!updateTask) {
            return res.json({ status: 500, message: `Failed move task to ${type_task}!` });
        }

        return res.json({ status: 200, message: 'Successfully move task!', data: updateTask });
    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error });
    }
};

const updateTask = async (req, res) => {
    try {
        
        const { task_id } = req.params
        const { task_title, task_description } = req.body

        const task = await taskModel.findById(task_id);
        
        if (req.file) {
            const originalName = req.file.originalname;
            const randomChars = crypto.randomBytes(4).toString('hex');
            attachment = `${randomChars}_${originalName}`;
            
            await cloudinary.uploader.destroy(task.attachment);

            cloudinary.uploader.upload_stream({ public_id: attachment }, (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                } else {
                    console.log('cloud result:', result);
                    task.attachment = result.secure_url;
                }
            }).end(req.file.buffer);
        } 

        task.task_title = task_title;
        task.task_description = task_description;

        await task.save();

        return res.json({ status: 200, message: 'Successfully updated task!' });

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error });
    }
}

const updateTaskDetail = async (req, res) => {
    try {
        const { task_id, task_title, task_description } = req.body;
        console.log(task_id, task_title, task_description)

        let attachment = null;

        if (req.file) {
            const originalName = req.file.originalname;
            const randomChars = crypto.randomBytes(4).toString('hex');
            attachment = `${randomChars}_${originalName}`;

            try {
                await new Promise((resolve, reject) => {
                    const upload_stream = cloudinary.uploader.upload_stream({ public_id: attachment }, (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            console.log('cloud result:', result);
                            attachment = result.secure_url;
                            resolve();
                        }
                    });

                    upload_stream.end(req.file.buffer);
                });
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                return res.json({ status: 500, message: 'Failed to update task due to Cloudinary error!' });
            }
        }

        const updateFields = { task_title, task_description };
        if (attachment) {
            updateFields.attachment = attachment;
        }

        const updateTask = await taskModel.findOneAndUpdate(
            { task_id },
            { $set: updateFields },
            { new: true }
        );

        if (!updateTask) {
            return res.json({ status: 500, message: 'Failed to update task in the database!' });
        }

        return res.json({ status: 200, message: 'Successfully updated task!' });

    } catch (error) {
        console.error('Server error:', error);
        return res.json({ status: 500, message: 'Server error!', error: error.message });
    }
};

module.exports = {
    createTask,
    getTaskById,
    removeTask,
    removeAllTask,
    moveTask,
    updateTask,
    updateTaskDetail
}