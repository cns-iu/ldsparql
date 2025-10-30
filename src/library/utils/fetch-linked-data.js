import formats from '@rdfjs/formats-common';
import { isReadableStream } from 'is-stream';
import jsonld from 'jsonld';
import patchResponse from 'nodeify-fetch/lib/patchResponse.browser.js';

export const EXTENSION_MAPPING = {
  'json-ld': 'application/ld+json',
  jsonld: 'application/ld+json',
  json: 'application/ld+json',
  nt: 'application/n-triples',
  nq: 'application/n-quads',
  n3: 'text/n3',
  owl: 'application/rdf+xml',
  rdf: 'application/rdf+xml',
  xml: 'application/rdf+xml',
  trig: 'application/trig',
  turtle: 'text/turtle',
  ttl: 'text/turtle',
  html: 'text/html',
  htm: 'text/html',
};

export async function fetchGraphData(url, preferredFormat = 'text/turtle') {
  if (typeof url === 'string' && url.startsWith('http')) {
    const parsers = formats.parsers;
    const otherFormats = Array.from(parsers.keys())
      .filter((k) => k !== preferredFormat)
      .sort()
      .reverse();

    const res = await fetch(url, {
      headers: new Headers({
        accept: [preferredFormat, ...otherFormats].join(', '),
      }),
    });

    const type = res.headers.get('content-type').split(';')[0];
    const extension = EXTENSION_MAPPING[url.split('.').slice(-1)[0]];
    const guessedType = parsers.has(type) ? type : parsers.has(extension) ? extension : undefined;
    if (guessedType) {
      const data = await res.text();
      return { data, format: guessedType };
    } else {
      return Promise.reject(new Error(`unknown content type: ${type}`));
    }
  } else {
    try {
      const json = typeof url === 'string' ? JSON.parse(url) : url;
      return { data: JSON.stringify(json), format: 'application/ld+json' };
    } catch (err) {
      return Promise.reject(new Error(`unknown content type: ${url}`));
    }
  }
}

export async function getQuads(url, preferredFormat = 'text/turtle') {
  if (typeof url === 'string' && url.startsWith('http')) {
    const parsers = formats.parsers;
    const otherFormats = Array.from(parsers.keys())
      .filter((k) => k !== preferredFormat)
      .sort()
      .reverse();

    const res = await fetch(url, {
      headers: new Headers({
        accept: [preferredFormat, ...otherFormats].join(', '),
      }),
    });

    const type = res.headers.get('content-type').split(';')[0];
    const extension = EXTENSION_MAPPING[url.split('.').slice(-1)[0]];
    const guessedType = parsers.has(type) ? type : parsers.has(extension) ? extension : undefined;
    if (type === 'application/json' || guessedType === 'application/ld+json') {
      const json = await res.json();
      const quads = await jsonld.toRDF(json);
      return quads;
    } else if (guessedType) {
      let body = res.body;
      if (!isReadableStream(body)) {
        body = patchResponse(res).body;
      }
      const stream = parsers.import(guessedType, body, { baseIRI: url });
      const quads = [];
      for await (const quad of stream) {
        quads.push(quad);
      }
      return quads;
    } else {
      // Try to parse the response as a JSON-LD string
      try {
        const json = JSON.parse(await res.text());
        const quads = await jsonld.toRDF(json);
        return quads;
      } catch (err) {
        console.log(err);
        return Promise.reject(new Error(`unknown content type: ${type}`));
      }
    }
  } else {
    try {
      const json = typeof url === 'string' ? JSON.parse(url) : url;
      const quads = await jsonld.toRDF(json);
      return quads;
    } catch (err) {
      return Promise.reject(new Error(`unknown content type for ${url}`));
    }
  }
}

/**
 * Ensure quads use dataFactory instances of types
 */
export function reformatQuads(quads, graph, dataFactory) {
  return quads.map((quad1) => {
    // Ensure datatype uses the dataFactory's NamedNode to work around sDataFactory.js's implementation.
    if (quad1.object.termType === 'Literal' && !quad1.object.datatype.equals) {
      quad1.object.datatype = dataFactory.namedNode(quad1.object.datatype.value);
    }
    const quad = dataFactory.quad(
      dataFactory.fromTerm(quad1.subject),
      dataFactory.fromTerm(quad1.predicate),
      dataFactory.fromTerm(quad1.object),
      graph
    );
    return quad;
  });
}
