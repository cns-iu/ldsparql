import { send } from '@jcubic/wayne';

// Setup channel to send query requests up to the main thread to run in workers
const channel = new BroadcastChannel('ldsparql_requests');

function endpointRoute(endpointType) {
  return async function (req, res) {
    /** Content Negotiation */
    let mimetype = 'application/sparql-results+json';
    const query = (await req.formData()).get('query');
    const results = await send(channel, 'sparql', [query, endpointType, mimetype]);
    res.json(results.result);
  };
}

function routes(app) {
  return app
    .post('/api/ld/sparql', endpointRoute('oxigraph'))
    .post('/api/ld/oxigraph/sparql', endpointRoute('oxigraph'))
    .post('/api/ld/n3/sparql', endpointRoute('n3'))
    .post('/api/ld/quadstore/sparql', endpointRoute('quadstore'));
}

export default routes;
