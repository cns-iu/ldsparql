import { Parser } from 'sparqljs';

function getGraphNamesWithTypeFromObject(obj) {
  const names = [];
  function traverse(o) {
    if (o && typeof o === 'object') {
      if (o.type === 'graph' && o.name) {
        names.push(o.name);
      }
      for (const key in o) {
        if (o.hasOwnProperty(key)) {
          traverse(o[key]);
        }
      }
    }
  }
  traverse(obj);
  return names;
}

export function namedGraphsInQuery(query, dataFactory = undefined) {
  const parser = new Parser({ skipValidation: true, factory: dataFactory });
  const parsed = parser.parse(query);
  const graphs = [
    ...(parsed.from?.default ?? []),
    ...(parsed.from?.named ?? []),
    ...getGraphNamesWithTypeFromObject(parsed),
  ];
  return graphs;
}
