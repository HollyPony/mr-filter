const express = require('express')
const path = require('path')
const app = express()

const config = require('config')

const api = require('./api')

const serverPort = config.get('serverPort')

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'))
})

app.get('/list', (req, res) => {
  res.set('Content-Type', 'application/javascript')
  api.listMergeRequests().then((projects) => {
    res.send(projects)
  })
})

app.listen(serverPort, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${serverPort}`)
})
