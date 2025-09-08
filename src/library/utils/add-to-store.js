async function addToStore(url, store, factory) {
  const graph = factory.namedNode(url);

  const count = await store.get({ graph }, { limit: 1 });
  if (count.items.length > 0) {
    return;
  }
  console.log('caching', url);

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
    for (const quad of quads) {
      quad.graph = graph;
    }
    store.multiPut(quads);
  } else if (parsers.has(type)) {
    const body = patchResponse(res).body;
    const stream = parsers.import(type, body, { baseIRI: url, factory });
    const quads = [];
    for await (const quad of stream) {
      quad.graph = graph;
      quads.push(quad);
    }
    store.multiPut(quads);
  } else {
    return Promise.reject(new Error(`unknown content type: ${type}`));
  }
}
