const Auth = require('../models/authModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const path = require('path')
const fs = require('fs')

const signUpUser = async (req, res) => {
    try {
        const { username, email, password } = req.body
       
        const equalUser = await Auth.findOne({ email })
        if(equalUser) return res.json({ status: 400, message: 'Email already exist!' })
 
        const tokenRandom = crypto.randomBytes(6).toString('hex')
          
        const salt = await bcrypt.genSalt(10)
        const passwordHashGenerate = await bcrypt.hash(password, salt)

        const newuser = new Auth({
            user_id: tokenRandom,
            username,
            email,
            password: passwordHashGenerate,
        })

        await newuser.save()
        return res.json({ status: 200, message: 'Successfully Register!' })

    } catch (error) {
        return res.json({ status: 500, message: 'Failed to signUp', error: error });
    }
}

const signInUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await Auth.findOne({  email })
        if(!user) return res.json({ status: 404, message: 'User not found!' })

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ status: 401, message: 'Incorrect password' });
        }

        const token = jwt.sign({ user_id: user.user_id }, 'flowTrush', { expiresIn: '5h' });
        return res.json({ status: 200, message: 'Successfully Login', token, data: user });
        
    } catch (error) {
        return res.json({ status: 500, message: 'Failed to signIn', error: error.message });
    }
} 

const removeUser = async (req, res) => {
    try {
        const { user_id } = req.params
        const user = await Auth.findOneAndDelete({ user_id });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found!' });
        }

        return res.json({ status: 200, message: 'Successfully remove account'});
        
    } catch (error) {
        return res.json({ status: 500, message: 'Failed to signIn', error: error.message });
    }
} 

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        const equalEmail = await Auth.findOne({ email })
        if(!equalEmail) return res.json({ status: 404, message: 'User not available!' })

        const resetTokenPassword = crypto.randomBytes(8).toString('hex')

        const filter = { email }
        const set = {
            resetTokenPassword
        }

        await Auth.updateOne(filter, set)

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'muhammadkhoirulhuda111@gmail.com',
                pass: 'pwdi hnbx usqq xwnh'
            }
        })

        const cssPath = path.join(__dirname, '../styles/styles.css');
        const cssStyles = fs.readFileSync(cssPath, 'utf8');
        
        const emailContent = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        ${cssStyles}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Reset Your Password</h2>
                        <p>You are receiving this email because you (or someone else) has requested to reset the password for your account. Please click the link below to reset your password:</p>
                        <a href="http://localhost:3000/auth/resetPassword/${resetTokenPassword}">Reset Password</a>
                        <p>If you didn't request this, please ignore this email, and your password will remain unchanged.</p>
                    </div>
                </body>
            </html>
        `;

        const mailOptions = {
            to: email,
            from: 'muhammadkhoirulhuda111@gmail.com',
            subject: 'Reset password by FlowTrush',
            html: emailContent
        }

        transporter.sendMail(mailOptions, async (err) => {
            if(err) return res.json({ status: 500, message: 'Failed sent email message!', error: err.message })
            return res.json({ status: 200, message: 'Successfully sent email message!' })
        })

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

const resetPassword = async (req, res) => {
    try {   
        const { token ,password } = req.body
        if (!password) {
            return res.status(400).json({ status: 400, message: 'Password is required!' });
        }
          
        const equalEmail = await Auth.findOne({ 
            resetTokenPassword: token,
        })

        if(!equalEmail) return res.json({ status: 404, message: 'Invalid or expired token!' })
        
        const salt = await bcrypt.genSalt(10)
        const newPassword = await bcrypt.hash(password, salt)

        const filter = { resetTokenPassword: token }
        const set = {
            password: newPassword,
            resetTokenPassword: '',
        }

        const updateResult = await Auth.updateOne(filter, set)

        if (updateResult) {
            return res.status(200).json({ status: 200, message: 'Password successfully reset!' });
        } else {
            return res.status(500).json({ status: 500, message: 'Failed to reset password!' });
        }

    } catch (error) {
        return res.json({ status: 500, message: 'Error server!', error: error.message })
    }
}

module.exports = {
    signInUser,
    signUpUser,
    removeUser,
    forgotPassword,
    resetPassword
};
