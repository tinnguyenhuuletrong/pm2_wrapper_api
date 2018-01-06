// content of index.js
const http = require('http')
const port = 3000

if (process.argv.length >= 2) {
    port = parseInt(process.argv[1])
}

const requestHandler = (request, response) => {
  console.log(request.url)
  response.end('Hello Node.js Server!')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})