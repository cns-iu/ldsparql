import { toNT } from '@rdfjs/to-ntriples';
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

export async function addToEndpoint(graph, quads, endpoint) {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(`CLEAR GRAPH <${graph}>;`);
      controller.enqueue(`INSERT DATA {\nGRAPH <${graph}> {`);
      for (const quad of quads) {
        const subject = toNT(quad.subject);
        const predicate = toNT(quad.predicate);
        const object = toNT(quad.object);
        const line = `${subject} ${predicate} ${object} .`;
        controller.enqueue(line);
      }
      controller.enqueue('}}');
    },
  });

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-update',
    },
    body: stream,
  });
}
