import init, * as oxigraph from 'oxigraph/web.js';
import wasm from 'oxigraph/web_bg.wasm';
import { SparqlEndpoint } from '../shared/sparql-endpoint.js';
import { fetchGraphData } from '../utils/fetch-linked-data.js';
import { namedGraphsInQuery } from '../utils/sparql-parser.js';

export class OxigraphDb extends SparqlEndpoint {
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
        const { data, format } = await fetchGraphData(graph.value);
        console.log('inserting', format, 'data,', data.length, 'bytes');
        this.store.load(data, { format, to_graph_name: graph });
        console.log('added', graph.value);
      }
    }
  }

  async doQuery(query, mimetype = 'application/sparql-results+json') {
    const result = this.store.query(query, { results_format: mimetype });
    return result;
  }
}
