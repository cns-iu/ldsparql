import toNT from '@rdfjs/to-ntriples';
import fetch from 'node-fetch';
import { Readable } from 'stream';
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

function toTripleString(quad) {
  const subject = toNT(quad.subject).replace('_:_:', '_:');
  const predicate = toNT(quad.predicate).replace('_:_:', '_:');
  const object = toNT(quad.object).replace('_:_:', '_:');
  return `${subject} ${predicate} ${object} .\n`;
}

function* sparqlUpdateIterator(graph, quads) {
  yield `
CLEAR GRAPH <${graph}>;
INSERT DATA {
GRAPH <${graph}> {
`;
  for (const quad of quads) {
    yield toTripleString(quad);
  }
  yield '}}\n';
}

export async function addToEndpoint(graph, quads, endpoint) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-update',
    },
    body: Readable.from(sparqlUpdateIterator(graph, quads)),
  });
}
