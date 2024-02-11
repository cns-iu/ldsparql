import { sparql } from './sparql.js';
import { ensureNamedGraphs } from './ensure-named-graphs.js';

export async function ldsparql(query, mimetype, endpoint) {
  await ensureNamedGraphs(query, endpoint);
  return sparql(query, mimetype, endpoint);
}
