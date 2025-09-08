import { Router } from 'express';
import { RemoteEndpoint } from '../../library/endpoints/remote.js';
import { isWritable, sparqlEndpoint } from '../environment.js';

function parseString(value) {
  return typeof value === 'string' ? value : undefined;
}

const sparql = async (req, res, _next) => {
  let queryBody;
  const format = parseString(req.query.format);
  switch (req.method) {
    case 'POST':
      queryBody = parseString(req.body?.query);
      break;
    case 'GET':
      queryBody = parseString(req.query.query);
      break;
    default:
      res.status(405).send('Unsupported operation.');
      res.end();
      return;
  }

  /** Content Negotiation */
  let mediaType = 'application/sparql-results+json';
  if (format) {
    mediaType = format;
    if (['simple', 'stats', 'table', 'tree'].includes(format)) {
      res.type('text/plain');
    } else {
      res.type(format);
    }
  } else {
    const mediaTypes = [
      'application/json',
      'application/ld+json',
      'application/n-quads',
      'application/n-triples',
      'application/rdf+xml',
      'application/sparql-results+json',
      'application/sparql-results+xml',
      'application/trig',
      'text/csv',
      'text/n3',
      'text/tab-separated-values',
      'text/turtle',
      'text/plain',
    ].reduce((acc, type) => {
      acc[type] = () => {
        mediaType = type;
      };
      return acc;
    }, {});
    res.format(mediaTypes);
  }

  const endpoint = new RemoteEndpoint(sparqlEndpoint(), isWritable());
  const results = await endpoint.query(queryBody, mediaType);
  res.write(results);
  res.end();
};

const routes = Router().get('/sparql', sparql).post('/sparql', sparql);

export default routes;
