import { ldsparql } from '../library/ldsparql.oxigraph.js';

function routes(app) {
  return app.post('/api/ld/sparql', async function (req, res) {
    const query = (await req.formData()).get('query');
    /** Content Negotiation */
    let mediaType = 'application/sparql-results+json';

    const results = await ldsparql(query, mediaType);
    res.json(results);
  });
}

export default routes;
