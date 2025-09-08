
const workers = {};

// query function to start and delegate queries to worker threads by endpoint type
export async function query(query, endpointType = 'oxigraph', mimetype = 'application/sparql-results+json') {
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