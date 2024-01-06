import { QueryEngine } from '@comunica/query-sparql-rdfjs';
import rdfFetch from '@rdfjs/fetch';
import defaultFormats from '@rdfjs/formats-common';
import { DataFactory, Store } from 'n3';
import { Parser } from 'sparqljs';

defaultFormats.parsers.set('application/json', defaultFormats.parsers.get('application/ld+json'));

async function getStore(query) {
  const parser = new Parser({ skipValidation: true, factory: DataFactory });
  const parsed = parser.parse(query);
  const store = new Store();

  const graphs = [...(parsed.from?.default ?? []), ...(parsed.from?.named ?? [])];
  await Promise.all(
    graphs.map(async (graph) => {
      const res = await rdfFetch(graph.value, {
        headers: new Headers({
          accept: 'application/ld+json',
        }),
        formats: defaultFormats,
      });

      const stream = await res.quadStream();
      for await (const quad of stream) {
        quad.graph = graph;
        store.add(quad);
      }
    })
  );

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
