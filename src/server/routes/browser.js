import { Router } from 'express';

const browserRoute = (_req, res, _next) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <link href="https://unpkg.com/@triply/yasgui/build/yasgui.min.css" rel="stylesheet" type="text/css" />
    <script src="https://unpkg.com/@triply/yasgui/build/yasgui.min.js"></script>
  </head>

  <body>
    <div id="yasgui"></div>
    <script>
      const scope = location.pathname.replace(/\/[^\/]+$/, '/');
      const yasgui = new Yasgui(document.getElementById('yasgui'), {
        requestConfig: { endpoint: '/sparql' },
        yasqe: {
          value: \`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT *
FROM <https://cdn.humanatlas.io/digital-objects/catalog.ttl>
FROM <https://cdn.humanatlas.io/digital-objects/asct-b/kidney/latest/graph.nt>
WHERE {
  ?sub ?pred ?obj .
} LIMIT 10
\`,
        },
      });
    </script>
  </body>
</html>
`);
};

const routes = Router().get('/', browserRoute).get('/index.html', browserRoute);

export default routes;
