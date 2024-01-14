// Call all library
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const dotenv = require('dotenv')
dotenv.config();

// 3 on use start (cors, express.json(), bodyParser.urlencoded)
app.use(cors())

// Get variable environment
const portServer = process.env.PORT_SERVER_RUNNING

// Connected on database ft mongodb
mongoose.connect(process.env.URL_MONGOOSE, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Successfully connect on database')
})
.catch((error) => {
    console.log(error)
})


// Middleware untuk mengatur timeout
app.use((req, res, next) => {
    res.setTimeout(20000, () => {
        res.status(408).send('Request timeout');
    });
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Middleware
const checkToken = require('./middlewares/verifyToken')

// Routers
const accountRouter = require('./routers/authRouter')
const workspaceRouter = require('./routers/workspaceRouter')
const boardRouter = require('./routers/boardRouter')
const taskRouter = require('./routers/taskRouter')

app.use('/account', accountRouter)
app.use('/workspace', checkToken, workspaceRouter)
app.use('/board', checkToken, boardRouter)
app.use('/task', checkToken, taskRouter)

app.get('/test', (req, res) => {
    res.send('test success!')   
})

// Running test
app.listen(portServer,() => {
    console.log(`Running on port ${portServer}`)
})