const express = require('express')
const path = require('path')
const app = express()

const config = require('config')

const api = require('./api')

const serverPort = config.get('serverPort')

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'))
})

app.get('/project/:id', (req, res) => {
  res.set('Content-Type', 'application/javascript')
  api.getProjectById(req.params.id).then((project) => {
    res.send(project)
  })
})

app.get('/approvals/:id/:iid', (req, res) => {
  res.set('Content-Type', 'application/javascript')
  api.getApprovals(req.params.id, req.params.iid).then((approvals) => {
    console.log()
    res.send(approvals)
  })
})

app.get('/list', (req, res) => {
  res.set('Content-Type', 'application/javascript')
  api.listMergeRequests().then((projects) => {
    res.send(projects)
  })
})

app.listen(serverPort, (err) => {
  if (err) {
    return console.log('Something bad happened', err)
  }

  console.log(`Server is listening on ${serverPort}`)
})
