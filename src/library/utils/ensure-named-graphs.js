import { addToEndpoint } from './add-to-endpoint.js';
import { getQuads } from './fetch-linked-data.js';
import { select } from './fetch-sparql.js';
import { namedGraphsInQuery } from './sparql-parser.js';

const QUERY = 'SELECT DISTINCT ?g WHERE {  GRAPH ?g { ?s ?p ?o . } }';

export async function namedGraphs(endpoint) {
  const graphs = await select(QUERY, endpoint);
  return new Set(graphs.map((graph) => graph.g));
}

export async function ensureNamedGraphs(query, endpoint) {
  const existingGraphs = await namedGraphs(endpoint);
  const graphs = namedGraphsInQuery(query).filter((graph) => !existingGraphs.has(graph.value));
  for (const graph of graphs) {
    console.log('fetching', graph.value);
    const quads = await getQuads(graph.value);
    console.log('inserting', quads.length, 'triples');
    await addToEndpoint(graph.value, quads, endpoint);
    console.log('added', graph.value);
  }
}
