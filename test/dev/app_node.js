// content of index.js
const http = require('http')
let port = 3000

for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == '-p')
        port = process.argv[i + 1];
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