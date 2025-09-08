import { N3Endpoint, OxigraphEndpoint, QuadstoreEndpoint, RemoteEndpoint } from '../library/endpoints/';

const params = new URL(self.location).searchParams;
const endpointType = params.get('endpoint') ?? 'oxigraph';
const endpointUrl = params.get('endpointUrl') ?? 'https://lod.humanatlas.io/sparql';
const endpointWritable = (params.get('writable') ?? 'false') === 'true';

let db;
switch (endpointType.toLowerCase()) {
  case 'remote':
    db = new RemoteEndpoint(endpointUrl, endpointWritable);
    break;
  case 'n3':
    db = new N3Endpoint();
    break;
  case 'quadstore':
    db = new QuadstoreEndpoint();
    break;
  case 'oxigraph':
  default:
    db = new OxigraphEndpoint();
    break;
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
