import { QueryEngine } from '@comunica/query-sparql';
import { BrowserLevel } from 'browser-level';
import { Quadstore } from 'quadstore';
import { Engine } from 'quadstore-comunica';
import { DataFactory } from 'rdf-data-factory';
import { SparqlEndpoint } from '../shared/sparql-endpoint';
import { getQuads } from '../utils/fetch-linked-data';
import { namedGraphsInQuery } from '../utils/sparql-parser';

export class QuadstoreEndpoint extends SparqlEndpoint {
  async initialize() {
    const dataFactory = (this.dataFactory = new DataFactory());
    const backend = (this.backend = new BrowserLevel('ldsparql'));
    this.store = new Quadstore({
      backend,
      dataFactory,
      // indexes: [
      //   ['graph', 'subject', 'predicate', 'object'],
      //   ['subject', 'predicate', 'object', 'graph'],
      // ],
    });
    await this.store.open();
    this.engine = new Engine(this.store);
    this.resultFormatter = new QueryEngine();
  }

  async prepareQuery(query) {
    const graphs = namedGraphsInQuery(query, this.dataFactory);
    for (const graph of graphs) {
      const count = await this.store.get({ graph }, { limit: 1 });
      if (count.items.length === 0) {
        console.log('fetching', graph.value);
        const quads = await getQuads(graph.value);
        console.log('inserting', quads.length, 'triples');
        this.store.multiPut(quads.map((quad) => {
          quad = this.dataFactory.fromQuad(quad);
          quad.graph = graph;
          return quad;
        }));
        console.log('added', graph.value);
      }
    }
  }

  async doQuery(query, mimetype = 'application/sparql-results+json') {
    const result = await this.engine.query(query, { sources: [this.store] });
    const { data } = await this.resultFormatter.resultToString(result, mimetype);
    let output = '';
    for await (const datum of data) {
      output += datum.toString();
    }
    return output;
  }
}
