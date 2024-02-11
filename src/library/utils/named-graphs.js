import { Parser } from 'sparqljs';

export function parseNamedGraphs(query) {
  const parser = new Parser({ skipValidation: true });
  const parsed = parser.parse(query);
  const graphs = [...(parsed.from?.default ?? []), ...(parsed.from?.named ?? [])];
  return graphs;
}
