cluster-wrap
===

light wrap around nodejs cluster
fork of throng https://github.com/hunterloftis/throng
grabbed emitter handling/proxying
removed lodash dependency
removed lifetime functionality


example usage:

  const clusterWrap = require('cluster-wrap');

  function worker(workerId) {
    console.log({ action: 'worker', workerId: workerId });
    // do some worker stuff    
  }

  function master() {
    console.log({ action: 'master' });
    // do some master stuff    
  }

  const concurrency = require('os').cpus().length;
  clusterWrap({
    worker  : worker,      // required worker function
    workers : concurrency, // optional, default ncpus
    master  : master       // optional, default () => {}
  })



