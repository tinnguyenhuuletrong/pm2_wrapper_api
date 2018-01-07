var assert = require('assert');
const Pm2API = require("../libs/pm2api")
const mockupData = require("./dev/mockup/data1.json")
    
describe('Basic', function() {

  let pm2Connect

  before(function(done) {
    pm2Connect = new Pm2API({
      onReady: _ => {done()}
    })
  });

  it('#cleanup', function(done) {
    pm2Connect.cleanUp()
      .then(res => {
        return pm2Connect.listAll();
      })
      .then(res => {
        assert.equal(res.length, 0, "List process shoule be empty")
        done()
      })
  });

  it('#spawnsingle', function(done) {
    pm2Connect.cleanUp()
      .then(res => {
        return pm2Connect.spawn(mockupData[0]);
      })
      .then(res => {
        assert.notEqual(res, null, "spawn successfull process")
        return pm2Connect.listAll();
      })
      .then(listProcess => {
        assert.equal(listProcess.length, 1, "List process shoule be 1")
        done();
      })
  });

  it('#spawnMultiple', function(done) {
    pm2Connect.cleanUp()
      .then(res => {
        return pm2Connect.spawnList(mockupData);
      })
      .then(res => {
        assert.notEqual(res, null, "spawn successfull process")
        return pm2Connect.listAll();
      })
      .then(listProcess => {
        assert.equal(listProcess.length, 2, "List process shoule be 2")
        done();
      })
  });

  after(function(done) {
    pm2Connect.cleanUp()
      .then(res => {
        pm2Connect.disconnect();
        done();
      })
  })
});