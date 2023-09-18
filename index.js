require('dotenv').config()
const express = require('express')
const app = express()
const PORT = 5000 || process.env.PORT

const expressLayout = require('express-ejs-layouts')
const cookiePaarser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const session = require('express-session')
const methodOverride = require('method-override')

const isActiveRoute = require('./server/heplers/routeHelpers')
// Connect db
const connectDB = require('./server/config/db')
connectDB()

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookiePaarser())
app.use(methodOverride('_method'))
app.use(session({
    secret: 'keybord cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL
    })
}))
app.use(express.static('public'))
// Template engine
app.use(expressLayout)

app.locals.isActiveRoute = isActiveRoute

app.set('layout', './layouts/main')
app.set('view engine', 'ejs')

app.use('/', require('./server/routes/main'))
app.use('/', require('./server/routes/admin'))
app.listen(PORT, ()=>{
    console.log(`App listing on port ${PORT}`)
})
