var pm2 = require('pm2');
var process = require('process');
var path = require('path');

const Pm2Api = function (options = {}) {
    this.options = options
    this._isConnected = false;

    pm2.connect((err) => {
        if (err != null) {
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

/**
 * Disconnects from the pm2 daemon.
 */
Pm2Api.prototype.disconnect = function () {
    pm2.disconnect((err) => {
        this._isConnected = false;
    })
}

/**
 * Clean up all running process
 */
Pm2Api.prototype.cleanUp = function () {
    return new Promise((resolve, reject) => {
        if (!this._isConnected)
            return reject("Not connected");

        // query all process
        this.listAll()
            .then(listProcess => {
                let jobs = listProcess.map(itm => this.removeProcess(itm.name))

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

/**
 * Remove process by name
 */
Pm2Api.prototype.removeProcess = function (name) {
    return new Promise((resolve, reject) => {
        if (!this._isConnected)
            return reject("Not connected");

        console.log("[pm2] kill process: ", name);

        // delete process
        pm2.delete(name, (err, data) => {
            if (err != null) {
                console.log('[pm2] error' + data)
                return reject(err)
            }

            resolve(data)

        })
    })
}

/**
 * Get process log
 */
Pm2Api.prototype.getLogInfo = function (name) {
    return new Promise((resolve, reject) => {
        if (!this._isConnected)
            return reject("Not connected");

        pm2.describe(name, (err, processInfo) => {
            if (err != null || processInfo == null || processInfo[0] == null) throw (err);

            processInfo = processInfo[0];

            const pathInfo = {
                log: processInfo.pm2_env.pm_out_log_path
            }

            resolve(pathInfo)
        })
    });
}

/**
 * List all running process
 */
Pm2Api.prototype.listAll = function (options = {}) {
    return new Promise((resolve, reject) => {
        if (!this._isConnected)
            return reject("Not connected");

        const delayTime = options.delayTime || 0

        setTimeout(() => {
            pm2.list((err, data) => {
                if (err != null) {
                    console.log('[pm2] error' + data)
                    return reject(err)
                }

                // trim data. Exclude myself!
                const resData = (data || []).map(itm => {
                    return {
                        pid: itm.pid,
                        name: itm.name,
                        args: itm.pm2_env.args,
                        status: itm.pm2_env.status,
                        pm2id: itm.pm2_env.pm_id,
                        exec_interpreter: itm.pm2_env.exec_interpreter,
                        up_time: itm.pm2_env.pm_uptime,
                        create_at: itm.pm2_env.created_at,
                        restart_time: itm.pm2_env.restart_time,
                    }
                })
                    .filter(itm => {
                        return itm.pid != process.pid
                    });

                resolve(resData)
            })
        }, delayTime);
    })
}

/**
 * Spawn process 
 *  @param  {Object} info       process info
 *  @example {
        "id": "node1",
        "script": "./test/dev/app_node.js",
        "engine": "node",
        "args": ["-p", "5000"]
    }
 */
Pm2Api.prototype.spawn = function (info) {
    const name = info.id;
    const script = info.script;
    const engine = info.engine;
    const args = info.args || [];
    const cwd = info.cwd || path.dirname(script);

    console.log("[pm2] start process: ", name, script, engine, args, cwd);
    return new Promise((resolve, reject) => {
        if (!this._isConnected)
            return reject("Not connected");

        if ([name, script, engine].indexOf(null) != -1)
            return reject("Missing arguments");

        pm2.start({
            name: name,
            script: script,
            args: args,
            interpreter: engine,
            cwd: cwd,
            mergeLogs: true
        }, (err, data) => {
            if (err != null) throw err;
            const processInfo = data[0];
            if (processInfo == null) throw new Error("Can't start process " + JSON.stringify(info));

            resolve(processInfo);
        })
    });
}

/**
 * Spawn process by list
 *  @param  {[Object]} listProcessInfo       list of process info
 *  @example [{
        "id": "node1",
        "script": "./test/dev/app_node.js",
        "engine": "node",
        "args": ["-p", "5000"]
    }]
 */
Pm2Api.prototype.spawnList = function (listProcessInfo) {
    return new Promise((resolve, reject) => {
        if (!this._isConnected)
            return reject("Not connected");

        const jobs = listProcessInfo.map(itm => this.spawn(itm));

        Promise.all(jobs)
            .then(res => resolve(res))
            .catch(err => reject(err));
    })
}

module.exports = Pm2Api;
