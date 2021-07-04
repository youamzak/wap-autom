const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const userRoutes = require('./routes/user.routes')
require('dotenv').config({path: './config/.env'})
require('./config/db')
const cors = require('cors')

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  'allowedHeaders' : ['sessionId', 'Content-Type'],
  'exposedHeaders' : ['sessionId'],
  'methods' : 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false
}

app.use(cors(corsOptions))

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
