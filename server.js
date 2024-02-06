if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const pool = require('./database')

const initializePassport = require('./passport-config')
initializePassport(passport)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const {name, email, password, passwordConfirm} = req.body
    const hashedPassword = await bcrypt.hash(password, 14)

    if ( passwordConfirm === password && password.length >= 8) {
      const query = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *"
      const values = [name, email, hashedPassword]
      const newUser = await pool.query(query, values)
      // res.status(200).json(newUser)
      res.status(200).redirect('/login')
    } 
    else if (password !== passwordConfirm) {
      res.render('register.ejs', {message: "Passwords do not match"})
    } 
    else if (password.length < 8) {
      res.render('register.ejs', {message: "Passwords must be at least 8 characters"})
    }

  } 
  catch (err) {
    console.log(err)
    res.redirect('/register')
  }
})

app.get('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(process.env.PORT || 3000)