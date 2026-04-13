const express = require('express')
const path = require('path')

const app = express()
const port = 8081

// Serve static files
app.use(express.static(__dirname))

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`)
  console.log(`Open: http://localhost:${port}/test-rbac-api.html`)
})