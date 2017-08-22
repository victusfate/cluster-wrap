'use strict';

const cluster       = require('cluster');
const EventEmitter  = require('events').EventEmitter;
const cpuCount      = require('os').cpus().length;

// grabbed emitter handling/proxying etc from https://github.com/hunterloftis/throng

const defaultOptions = {
  workers: cpuCount,
  grace: 5000
};

const clusterWrap = (oInOptions) => {
  console.log('called',process.pid)
  let options     = oInOptions || {};
  options.workers = oInOptions.workers ? oInOptions.workers : defaultOptions.workers;
  options.grace   = oInOptions.grace   ? oInOptions.grace   : defaultOptions.grace;
  let worker      = oInOptions.worker; // only required arg
  let master      = oInOptions.master || (() => {});

  if (typeof worker !== 'function') {
    throw new Error('options.worker function required');
  }

  if (cluster.isWorker) {
    return worker(cluster.worker.id);
  }

  // master
  let emitter = new EventEmitter();
  let running = true;

  function listen() {
    cluster.on('exit', revive);
    emitter.once('shutdown', shutdown);
    process
      .on('SIGINT', proxySignal)
      .on('SIGTERM', proxySignal);
  }

  function fork() {
    for (let i = 0; i < options.workers; i++) {
      cluster.fork();
    }
  }

  listen();
  if (cluster.isMaster) {  
    master();
    fork();
  }

  function proxySignal() {
    emitter.emit('shutdown');
  }

  function shutdown() {
    running = false;
    // kill workers
    for (let id in cluster.workers) {
      cluster.workers[id].process.kill();
    }
    // hard stop master process at grace timeout
    // if nothing else is cooking exit https://nodejs.org/api/timers.html#timers_timeout_unref
    setTimeout(forceKill, options.grace).unref();
  }

  // only revive if cluster-wrap main proc is running
  function revive(worker, code, signal) {
    if (running) cluster.fork();
  }

  // kill it with fire
  function forceKill() {
    for (let id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit();
  }
};

module.exports = clusterWrap;
