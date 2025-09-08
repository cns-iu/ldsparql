import { N3Endpoint, OxigraphEndpoint, QuadstoreEndpoint } from '../library/endpoints/';

function endpointRoute(db) {
  return async function (req, res) {
    const query = (await req.formData()).get('query');
    /** Content Negotiation */
    let mediaType = 'application/sparql-results+json';

    const results = await db.query(query, mediaType);
    res.json(results);
  };
}

function routes(app) {
  const oxigraph = new OxigraphEndpoint();
  const n3 = new N3Endpoint();
  const quadstore = new QuadstoreEndpoint();

  return app
    .post('/api/ld/sparql', endpointRoute(oxigraph))
    .post('/api/ld/oxigraph/sparql', endpointRoute(oxigraph))
    .post('/api/ld/n3/sparql', endpointRoute(n3))
    .post('/api/ld/quadstore/sparql', endpointRoute(quadstore));
}

export default routes;
