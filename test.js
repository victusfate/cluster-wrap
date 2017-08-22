const cluster       = require('cluster');
const clusterWrap   = require('./index');

let workerIntervals = {};

function worker(workerId) {
  console.log({ action: 'worker.started', workerId: workerId });
  let dT = Math.floor(Math.random()*3000);
  // don't create multiple intervals for a single worker
  if (workerIntervals[workerId] == null) {
    workerIntervals[workerId] = setInterval( () => {
      dT = Math.floor(Math.random()*3000);
      console.log({ action: 'worker.beep', workerId: workerId, dT:dT });
    },dT)        
  }
}

function master() {
  console.log({ action: 'master.started' });
  setInterval( () => {
    console.log({ action: 'master.boop' });
  },3000)    
}

const concurrency = require('os').cpus().length;
if (cluster.isMaster) {
  console.log({ action: 'app', concurrency: concurrency, isMaster: cluster.isMaster, pid: process.pid })
}
clusterWrap({
  worker  : worker,
  workers : concurrency, // optional, default ncpus
  master  : master       // optional, default () => {}
});
