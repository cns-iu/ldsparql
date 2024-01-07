import { QueryEngine } from '@comunica/query-sparql-rdfjs';
import formats from '@rdfjs/formats-common';
import jsonld from 'jsonld';
import { DataFactory, Store } from 'n3';
import patchResponse from 'nodeify-fetch/lib/patchResponse.browser.js';
import { Parser } from 'sparqljs';

async function addToStore(url, store) {
  const graph = DataFactory.namedNode(url);
  const parsers = formats.parsers;
  const res = await fetch(url, {
    headers: new Headers({
      accept: [...parsers.keys()].join(', '),
    }),
  });

  const type = res.headers.get('content-type').split(';')[0];
  if (type === 'application/json' || type === 'application/ld+json') {
    const json = await res.json();
    const quads = await jsonld.toRDF(json);
    for (const quad of quads) {
      quad.graph = graph;
      store.add(quad);
    }
  } else if (parsers.has(type)) {
    const body = patchResponse(res).body;
    const stream = parsers.import(type, body, { baseIRI: url });
    for await (const quad of stream) {
      quad.graph = graph;
      store.add(quad);
    }
  } else {
    return Promise.reject(new Error(`unknown content type: ${type}`));
  }
}

async function getStore(query) {
  const parser = new Parser({ skipValidation: true, factory: DataFactory });
  const parsed = parser.parse(query);
  const graphs = [...(parsed.from?.default ?? []), ...(parsed.from?.named ?? [])];
  const store = new Store();
  await Promise.all(graphs.map((graph) => addToStore(graph.value, store)));
  return store;
}

export async function ldsparql(query, mimetype) {
  const engine = new QueryEngine();
  const store = await getStore(query);
  const result = await engine.query(query, { sources: [store] });
  const { data } = await engine.resultToString(result, mimetype);
  let output = '';
  for await (const datum of data) {
    output += datum.toString();
  }
  return output;
}
