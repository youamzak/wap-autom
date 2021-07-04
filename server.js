const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const userRoutes = require('./routes/user.routes')
require('dotenv').config({path: './config/.env'})
require('./config/db')

// parsers
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// routes
app.use('/api/user', userRoutes)

//server 
app.listen(process.env.PORT, ()=>{
  console.log(`Listening on the port ${process.env.PORT}`)
})
