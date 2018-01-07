const Pm2API = require("./libs/pm2api")
const mockupData = require("./test/dev/mockup/data1.json");

const pm2Connect = new Pm2API({
    onReady: onReady
})

function onReady(pm2Connect) {
    pm2Connect.cleanUp()
        .then(info => {
            return pm2Connect.spawnList(mockupData);
        })
        .then(info => {
            return pm2Connect.listAll({delayTime: 2000});
        })
        .then(allProcess => {
            console.log(allProcess);
            pm2Connect.disconnect();
        })
        .catch(err => {
            console.log("Error", err)
            pm2Connect.disconnect();
        })
}