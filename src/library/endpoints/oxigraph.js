import jsonld from 'jsonld';
import init, * as oxigraph from 'oxigraph/web.js';
import wasm from 'oxigraph/web_bg.wasm';
import { SparqlEndpoint } from '../shared/sparql-endpoint.js';
import { fetchGraphData } from '../utils/fetch-linked-data.js';
import { namedGraphsInQuery } from '../utils/sparql-parser.js';

export class OxigraphEndpoint extends SparqlEndpoint {
  async initialize() {
    await init({ module_or_path: wasm });
    this.store = new oxigraph.Store();
  }

  async prepareQuery(query) {
    const graphs = namedGraphsInQuery(query, oxigraph);
    const namedGraphs = new Set(
      this.store.query('SELECT DISTINCT ?g WHERE { GRAPH ?g { ?s ?p ?o . } }').map((s) => s.get('g').value)
    );
    for (const graph of graphs) {
      if (!namedGraphs.has(graph.value)) {
        console.log('fetching', graph.value);
        let { data, format } = await fetchGraphData(graph.value);
        // oxigraph can't load JSON-LD files that reference external contexts
        // work around it by using jsonld.js to parse and convert to n-quads
        if (format === 'application/ld+json') {
          format = 'application/n-quads';
          data = await jsonld.toRDF(JSON.parse(data), { format });
        }
        console.log('inserting', format, 'data,', data.length, 'bytes');
        this.store.load(data, { format, to_graph_name: graph });
        console.log('added', graph.value);
      }
    }
  }

  async doQuery(query, mimetype = 'application/sparql-results+json') {
    const result = this.store.query(query, { results_format: mimetype, use_default_graph_as_union: true });
    return result;
  }
}
