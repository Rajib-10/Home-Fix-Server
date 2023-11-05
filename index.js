const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

// middleware 

app.use(cors())

app.get('/', (req, res) => {
  res.send('Home-Fix is running....')
})

app.listen(port, () => {
  console.log(`Home-Fix is listening on port ${port}`)
})