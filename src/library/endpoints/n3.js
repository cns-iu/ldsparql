import { QueryEngine } from '@comunica/query-sparql';
import { Store } from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { SparqlEndpoint } from '../shared/sparql-endpoint';
import { getQuads } from '../utils/fetch-linked-data';
import { namedGraphsInQuery } from '../utils/sparql-parser';

export class N3Endpoint extends SparqlEndpoint {
  async initialize() {
    this.store = new Store();
    this.dataFactory = new DataFactory();
    this.engine = new QueryEngine();
  }

  async prepareQuery(query) {
    const graphs = namedGraphsInQuery(query);
    for (const graph of graphs) {
      const count = this.store.countQuads(undefined, undefined, undefined, graph);
      if (count === 0) {
        console.log('fetching', graph.value);
        const quads = await getQuads(graph.value);
        console.log('inserting', quads.length, 'triples');
        this.store.addQuads(quads);
        console.log('added', graph.value);
      }
    }
  }

  async doQuery(query, mimetype = 'application/sparql-results+json') {
    const result = await this.engine.query(query, { sources: [this.store] });
    const { data } = await this.engine.resultToString(result, mimetype);
    let output = '';
    for await (const datum of data) {
      output += datum.toString();
    }
    return output;
  }
}
