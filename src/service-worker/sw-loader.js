import { rpc } from '@jcubic/wayne';
import { query } from './sparql-worker-runner.js';

if ('serviceWorker' in navigator) {
  const scope = location.pathname.replace(/\/[^\/]+$/, '/');
  if (navigator.serviceWorker.controller === null) {
    location.reload();
  }
  navigator.serviceWorker
    .register('sw.js', { scope, type: 'module' })
    .then(function (reg) {
      reg.addEventListener('updatefound', function () {
        const installingWorker = reg.installing;
        console.log('A new service worker is being installed:', installingWorker);
      });
      console.log('Registration succeeded. Scope is ' + reg.scope);
    })
    .catch(function (error) {
      console.log('Registration failed with ' + error);
    });

  // Setup client-side of RPC to delegate requests to workers
  const channel = new BroadcastChannel('ldsparql_requests');
  rpc(channel, {
    sparql: async function(queryString, endpointType, mimetype) {
      return query(queryString, endpointType, mimetype)
    }
  });
}

// Expose sparql function for the console
window.sparql = query;
