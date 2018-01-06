const Pm2API = require("./libs/pm2api")

const pm2Connect = new Pm2API({
    onReady: onReady
})

function onReady(pm2Connect) {
    // pm2Connect.cleanUp()
    //     .then(processList => {
    //         console.log('cleanup!')
    //         pm2Connect.disconnect();
    //     })
    //     .catch(err => {
    //         console.log(err)
    //     })


    pm2Connect.listAll()
    .then(listRooms => {
        return pm2Connect.cleanUp()
    })
    .then(_ => {
        return pm2Connect.disconnect()
    })
    
}