import { rpc } from '@jcubic/wayne';

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
}

// Setup client-side of RPC to delegate requests to workers
const channel = new BroadcastChannel('ldsparql_requests');
rpc(channel, {
  sparql: async function(queryString, endpointType, mimetype) {
    return query(queryString, endpointType, mimetype)
  }
});


// Setup query function to start and delegate queries to worker threads by endpoint type
const workers = {};
async function query(query, endpointType = 'oxigraph', mimetype = 'application/sparql-results+json') {
  if (!workers[endpointType]) {
    workers[endpointType] = new Worker(`./endpoint-worker.js?endpoint=${endpointType}`, { type: 'module' });
  }
  const worker = workers[endpointType];

  const results = await new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const onMessage = (event) => {
      if (event.data.id === id) {
        worker.removeEventListener('message', onMessage);
        resolve(event.data.results);
      }
    };
    worker.addEventListener('message', onMessage);
    worker.postMessage({ type: 'query', id, query, mimetype });
  });

  return results;
}

// Expose a sparql function for the console
window.sparql = query;
