import { Router } from 'express';

const browserRoute = (_req, res, _next) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>LDSPARQL: Query Linked Data with LDSPARQL</title>
    <link href="https://unpkg.com/@triply/yasgui/build/yasgui.min.css" rel="stylesheet" type="text/css" />
    <script src="https://unpkg.com/@triply/yasgui/build/yasgui.min.js"></script>
  </head>

  <body>
    <div id="yasgui"></div>
    <script>
      const scope = location.pathname.replace(/\\\/[^\\/]+$/, '/');
      const yasgui = new Yasgui(document.getElementById('yasgui'), {
        requestConfig: { endpoint: '/sparql' },
        yasqe: {
          value: \`#+ summary: Get currently loaded named graphs
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?g
WHERE {
  GRAPH ?g {
    ?sub ?pred ?obj .
  }
}          
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
