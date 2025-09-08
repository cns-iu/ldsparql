import { timer } from '../utils/promise-timer.js';

/**
 * Abstract base class for SPARQL database implementations.
 * @abstract
 */
export class SparqlEndpoint {
  #initializer;

  constructor() {
    this.#initializer = this.initialize();
  }

  async initialize() {}

  async prepareQuery(query) {}

  /**
   * Abstract method to do the work of executing a SPARQL query.
   * Must be implemented by subclasses.
   * @abstract
   * @param {string} query - The SPARQL query string to execute.
   * @param {string} [mimetype] - Optional MIME type for the result format.
   * @returns {Promise<string>} The result of the query.
   * @throws {Error} If not implemented in subclass.
   */
  async doQuery(query, mimetype) {
    throw new Error('Must implement doQuery()');
  }

  /**
   * Execute a SPARQL query
   * @abstract
   * @param {string} query - The SPARQL query string to execute.
   * @param {string} [mimetype] - Optional MIME type for the result format.
   * @returns {Promise<string>} The result of the query.
   * @throws {Error} If not implemented in subclass.
   */
  async query(query, mimetype) {
    await this.#initializer;
    await timer('prepare query', this.prepareQuery(query));
    return await timer('query', this.doQuery(query, mimetype));
  }
}
