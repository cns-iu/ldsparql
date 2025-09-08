import { N3Endpoint, OxigraphEndpoint, QuadstoreEndpoint } from '../library/endpoints/';

const params = new URL(self.location).searchParams;
const endpointType = params.get('endpoint') ?? 'oxigraph';

let db;
switch (endpointType.toLowerCase()) {
  case 'n3':
    db = new N3Endpoint();
  case 'quadstore':
    db = new QuadstoreEndpoint();
  case 'oxigraph':
  default:
    db = new OxigraphEndpoint();
}

self.onmessage = async (event) => {
  const { type, id, query, mimetype } = event.data;

  if (type === 'query') {
    const results = await db.query(query, mimetype);
    self.postMessage({ id, results });
  } else {
    console.log('bad event:', event);
  }
};
