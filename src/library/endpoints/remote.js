import { SparqlEndpoint } from '../shared/sparql-endpoint.js';
import { ensureNamedGraphs } from '../utils/ensure-named-graphs.js';
import { fetchSparql } from '../utils/fetch-sparql.js';


export class RemoteEndpoint extends SparqlEndpoint {
  #endpoint;
  #writable;

  constructor(endpoint, writable) {
    super();
    this.#endpoint = endpoint;
    this.#writable = !!writable;
  }

  async initialize() {}

  async prepareQuery(query) {
    if (this.#writable) {
      await ensureNamedGraphs(query, this.#endpoint);
    }
  }

  async doQuery(query, mimetype = 'application/sparql-results+json') {
    const results = await fetchSparql(query, this.#endpoint, mimetype);
    const output = await results.text();
    return output;
  }
}
