import { addToEndpoint } from '../utils/add-to-endpoint.js';
import { getQuads } from '../utils/fetch-linked-data.js';
import { parseNamedGraphs } from '../utils/named-graphs.js';
import { namedGraphs } from './named-graphs.js';

export async function ensureNamedGraphs(query, endpoint) {
  const existingGraphs = await namedGraphs(endpoint);
  const graphs = parseNamedGraphs(query).filter((graph) => !existingGraphs.has(graph));
  for (const graph of graphs) {
    const quads = await getQuads(graph);
    await addToEndpoint(graph, quads, endpoint);
  }
}
