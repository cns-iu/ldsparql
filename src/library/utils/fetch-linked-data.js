import formats from '@rdfjs/formats-common';
import { isReadableStream } from 'is-stream';
import jsonld from 'jsonld';
import patchResponse from 'nodeify-fetch/lib/patchResponse.browser.js';

export async function getQuads(url) {
  const parsers = formats.parsers;
  const res = await fetch(url, {
    headers: new Headers({
      accept: [...parsers.keys()].sort().reverse().join(', '),
    }),
  });

  const type = res.headers.get('content-type').split(';')[0];
  if (type === 'application/json' || type === 'application/ld+json') {
    const json = await res.json();
    const quads = await jsonld.toRDF(json);
    return quads;
  } else if (parsers.has(type)) {
    let body = res.body;
    if (!isReadableStream(rody))  {
      body = patchResponse(res).body;
    }
    const stream = parsers.import(type, body, { baseIRI: url, factory: store.factory });
    return stream;
  } else {
    return Promise.reject(new Error(`unknown content type: ${type}`));
  }
}
