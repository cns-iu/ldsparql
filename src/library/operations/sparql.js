import { fetchSparql } from '../utils/fetch-sparql.js';

export function sparql(query, mimetype, endpoint) {
  return fetchSparql(query, endpoint, mimetype);
}
