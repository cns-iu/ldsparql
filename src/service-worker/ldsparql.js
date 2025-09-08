import { OxigraphEndpoint } from '../library/endpoints/';

function routes(app) {
  const db = new OxigraphEndpoint();
  return app.post('/api/ld/sparql', async function (req, res) {
    const query = (await req.formData()).get('query');
    /** Content Negotiation */
    let mediaType = 'application/sparql-results+json';

    const results = await db.query(query, mediaType);
    res.json(results);
  });
}

export default routes;
