const fs = require('fs')
const os = require('os')
const Pm2API = require('./libs/pm2api')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())


const pm2Connect = new Pm2API()

let RUNNING_PORT = process.env.RUNNING_PORT || 3001

app.get('/', (req, res) => {
    res.json({
        name: 'RoomSpawner',
        hostname: os.hostname(),
        port: RUNNING_PORT
    })
})

app.get('/clean', (req, res) => {
    pm2Connect.cleanUp()
        .then(_ => {
            res.json({
                result: "ok"
            })
        })
        .catch(err => {
            res.json({
                err: err
            })
        })
})

app.get('/list', (req, res) => {
    pm2Connect.listAll()
        .then(processList => res.json(processList))
        .catch(err => res.json({ err: err }));
})

app.get('/log/:name', (req, res) =>{
    var processName = req.params.name;
    pm2Connect.getLogInfo(processName)
        .then(logInfo => {
            fs.createReadStream(logInfo.log).pipe(res);
        })
        .catch(err => res.json({ err: err }));
})

app.post('/updateProcess', (req, res) => {
    const info = req.body;

    const needCleanup = info.cleanUp ? true : false;
    const processInfos = info.process || [];

    const beginJob = needCleanup ? pm2Connect.cleanUp() : Promise.resolve(1);

    beginJob
        .then(res => {
            return pm2Connect.spawnList(processInfos)
        })
        .then(res => {
            return pm2Connect.listAll()
        })
        .then(processList => res.json(processList))
        .catch(err => res.json({ err: err }));

})


app.listen(RUNNING_PORT, () => console.log(`Example app listening on port ${RUNNING_PORT}!`))