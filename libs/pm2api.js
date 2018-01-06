var pm2 = require('pm2');

const Pm2Api = function (options) {
    this.options = options
    this._isConnected = false;
    
    pm2.connect((err) => {
        if(err != null) {
            const onError = this.options.onError || function () { }
            console.log('[pm2] connecting error ', err)
            return onError(err);
        }

        this._isConnected = true;
        const onReady = this.options.onReady || function () { }
        console.log('[pm2] connected')
        onReady(this);
    })
}

Pm2Api.prototype.disconnect = function () {
    pm2.disconnect((err) => {
        this._isConnected = false;
    })
}

Pm2Api.prototype.cleanUp = function () {
    return new Promise((resolve, reject) => {
        if (!this._isConnected) 
            return reject("Not connected");
        
        // query all process
        this.listAll()
            .then(listProcess => {
                let jobs = listProcess.map(itm => {
                    return this.removeProcess(itm.name)
                })

                // clean all
                Promise.all(jobs)
                    .then(res => {
                        resolve(res)
                    })
                    .catch(err => {
                        console.log('[pm2] error. cleanUp step 2')
                        reject(err)
                    })

                
            })
            .catch(err => {
                console.log('[pm2] error. cleanUp step 1')
                reject(err)
            })
    })
}

Pm2Api.prototype.removeProcess = function (name) {
    return new Promise((resolve, reject) => {
        if (!this._isConnected) 
            return reject("Not connected");

        // delete process
        pm2.delete(name, (err, data) => {
            if(err != null){
                console.log('[pm2] error' + data)
                return reject(err)
            }

            resolve(data)
                
        })
    })
}

Pm2Api.prototype.listAll = function () {
    return new Promise((resolve, reject) => {
        if (!this._isConnected) 
            return reject("Not connected");

        pm2.list((err, data) => {
            if (err != null) {
                console.log('[pm2] error' + data)
                return reject(err)
            }
            
            // trim data
            const resData = (data || []).map(itm => {
                
                return {
                    pid: itm.pid,
                    name: itm.name,
                    exec_interpreter: itm.pm2_env.exec_interpreter,
                    up_time: itm.pm2_env.pm_uptime,
                    create_at: itm.pm2_env.created_at,
                    restart_time: itm.pm2_env.restart_time,
                }
            })

            resolve(resData)
        })
    })
}

module.exports = Pm2Api;
