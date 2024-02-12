import { QueryEngine } from '@comunica/query-sparql';
import formats from '@rdfjs/formats-common';
import { BrowserLevel } from 'browser-level';
import jsonld from 'jsonld';
import patchResponse from 'nodeify-fetch/lib/patchResponse.browser.js';
import { Quadstore } from 'quadstore';
import { DataFactory } from 'rdf-data-factory';
import { Parser } from 'sparqljs';

async function addToStore(url, store, factory) {
  const graph = factory.namedNode(url);

  const count = await store.get({ graph }, { limit: 1 });
  if (count.items.length > 0) {
    return;
  }
  console.log('caching', url);

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
    }
    store.multiPut(quads);
  } else if (parsers.has(type)) {
    const body = patchResponse(res).body;
    const stream = parsers.import(type, body, { baseIRI: url, factory });
    const quads = [];
    for await (const quad of stream) {
      quad.graph = graph;
      quads.push(quad);
    }
    store.multiPut(quads);
  } else {
    return Promise.reject(new Error(`unknown content type: ${type}`));
  }
}

async function getStore(query) {
  const dataFactory = new DataFactory();
  const backend = new BrowserLevel('ldsparql');
  const store = new Quadstore({ backend, dataFactory });
  await store.open();

  const parser = new Parser({ skipValidation: true, factory: dataFactory });
  const parsed = parser.parse(query);
  const graphs = [...(parsed.from?.default ?? []), ...(parsed.from?.named ?? [])];
  await Promise.all(graphs.map((graph) => addToStore(graph.value, store, dataFactory)));
  return store;
}

export async function ldsparql(query, mimetype) {
  const engine = new QueryEngine();
  const store = await getStore(query);
  console.log('store initialized');
  const result = await engine.query(query, { sources: [store] });
  const { data } = await engine.resultToString(result, mimetype);
  let output = '';
  for await (const datum of data) {
    output += datum.toString();
  }
  store.close();
  return output;
}
