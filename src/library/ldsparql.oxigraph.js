import formats from '@rdfjs/formats-common';
import { BrowserLevel } from 'browser-level';
import jsonld from 'jsonld';
import patchResponse from 'nodeify-fetch/lib/patchResponse.browser.js';
import init, * as oxigraph from 'oxigraph/web.js';
import wasm from 'oxigraph/web_bg.wasm';
import { Quadstore } from 'quadstore';
import { DataFactory } from 'rdf-data-factory';
import { Parser } from 'sparqljs';

const oxigraphStore = init(wasm).then(() => new oxigraph.Store());
const dataFactory = new DataFactory();

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

async function getStore(query) {
  const backend = new BrowserLevel('ldsparql');
  const store = new Quadstore({ backend, dataFactory, indexes: [['graph', 'subject', 'predicate', 'object']] });
  await store.open();

  const parser = new Parser({ skipValidation: true, factory: dataFactory });
  const parsed = parser.parse(query);
  const graphs = [...(parsed.from?.default ?? []), ...(parsed.from?.named ?? [])];
  await Promise.all(graphs.map((graph) => addToStore(graph.value, store, dataFactory)));
  return store;
}

async function getOxigraphStore(query, dataStore) {
  const store = await oxigraphStore;
  const parser = new Parser({ skipValidation: true, factory: oxigraph });
  const parsed = parser.parse(query);
  const graphs = [...(parsed.from?.default ?? []), ...(parsed.from?.named ?? [])];
  const namedGraphs = new Set(
    store.query('SELECT DISTINCT ?g WHERE { GRAPH ?g { ?s ?p ?o . } }').map((s) => s.get('g').value)
  );
  for (const graph of graphs) {
    if (!namedGraphs.has(graph.value)) {
      console.log('adding', graph.value);
      const graphQuads = await dataStore.get({ graph });
      for (const quad of graphQuads.items) {
        store.add(quad);
      }
    }
  }
  return store;
}

export async function ldsparql(query, mimetype) {
  const dataStore = await getStore(query);
  console.log('cached quads');
  const store = await getOxigraphStore(query, dataStore);
  console.log('oxigraph updated');
  const result = await store.query(query);
  console.log(result);
  const output = JSON.stringify(result, null, 2);
  return output;
}
