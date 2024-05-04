const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

const users = []

app.post('/api/users', (req, res) => {
  const { username } = req.body
  const existingUser = users.find((user) => user.username === username)

  if (existingUser) {
    return res.send({
      username: existingUser.username,
      _id: existingUser._id
    })
  }

  const _id = uuidv4()

  const newUser = {
    username,
    _id
  }

  users.push(newUser)

  res.send(newUser)
})

app.get('/api/users', (req, res) => {
  res.send(users.map((user) => ({ username: user.username, _id: user._id })))
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { ':_id': _id, description, duration, date } = req.body

  try {
    const existingUser = users.find((user) => user._id === _id)

    // Debug
    console.log({
      users,
      _id
    })

    if (!existingUser) {
      throw new Error('User not found')
    }

    if (!description || !duration) {
      throw new Error('Description and duration are required')
    }

    const exercise = {
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
      duration: parseInt(duration),
      description
    }

    existingUser.exercises = existingUser.exercises || []

    existingUser.exercises.push(exercise)

    res.send({
      _id: existingUser._id,
      username: existingUser.username,
      date: exercise.date,
      duration: exercise.duration,
      description: exercise.description
    })
  } catch (err) {
    console.log(err)
    res.send({ error: err.message })
  }
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query

  try {
    const existingUser = users.find((user) => user._id === _id)

    if (!existingUser) {
      throw new Error('User not found')
    }

    let logs = existingUser.exercises || []

    if (from) {
      logs = logs.filter((log) => new Date(log.date) >= new Date(from))
    }

    if (to) {
      logs = logs.filter((log) => new Date(log.date) <= new Date(to))
    }

    if (limit) {
      logs = logs.slice(0, limit)
    }

    res.send({
      _id: existingUser._id,
      username: existingUser.username,
      count: logs.length,
      log: logs
    })
  } catch (err) {
    console.log(err)
    res.send({ error: err.message })
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
