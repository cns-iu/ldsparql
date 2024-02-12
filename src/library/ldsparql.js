import { QueryEngine } from '@comunica/query-sparql';
import formats from '@rdfjs/formats-common';
import { BrowserLevel } from 'browser-level';
import jsonld from 'jsonld';
import { Store } from 'n3';
import patchResponse from 'nodeify-fetch/lib/patchResponse.browser.js';
import { Quadstore } from 'quadstore';
import { DataFactory } from 'rdf-data-factory';
import { Parser } from 'sparqljs';

const dataFactory = new DataFactory();
const store = new Store();

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
      accept: [...parsers.keys()].sort().reverse().join(', '),
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

async function openQuadstore() {
  const backend = new BrowserLevel('ldsparql');
  const store = new Quadstore({ backend, dataFactory, indexes: [['graph', 'subject', 'predicate', 'object']] });
  await store.open();
  return store;
}

async function getStore(query) {
  const store = await openQuadstore();
  const parser = new Parser({ skipValidation: true, factory: dataFactory });
  const parsed = parser.parse(query);
  const graphs = [...(parsed.from?.default ?? []), ...(parsed.from?.named ?? [])];
  await Promise.all(graphs.map((graph) => addToStore(graph.value, store, dataFactory)));
  console.log('saving cache');
  await store.close().then(() => console.log('saved cache'));
  return await openQuadstore();
}

async function getMemStore(query, dataStore) {
  const parser = new Parser({ skipValidation: true, factory: dataFactory });
  const parsed = parser.parse(query);
  const graphs = [...(parsed.from?.default ?? []), ...(parsed.from?.named ?? [])];

  for (const graph of graphs) {
    const count = store.countQuads(undefined, undefined, undefined, graph);
    if (count === 0) {
      console.log('adding', graph.value);
      const graphQuads = await dataStore.get({ graph });
      store.addQuads(graphQuads.items);
    }
  }
  return store;
}

export async function ldsparql(query, mimetype) {
  const engine = new QueryEngine();
  const dataStore = await getStore(query);
  console.log('db store initialized');
  const store = await getMemStore(query, dataStore);
  console.log('n3 store initialized');
  const result = await engine.query(query, { sources: [store] });
  const { data } = await engine.resultToString(result, mimetype);
  let output = '';
  for await (const datum of data) {
    output += datum.toString();
  }
  dataStore.close();
  return output;
}
