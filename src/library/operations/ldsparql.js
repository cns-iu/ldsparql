import { sparql } from './sparql.js';
import { ensureNamedGraphs } from './ensure-named-graphs.js';

export async function ldsparql(query, mimetype, endpoint) {
  try {
    await ensureNamedGraphs(query, endpoint);
  } catch (err) {
    console.error(err);
  }
  return sparql(query, mimetype, endpoint);
}
