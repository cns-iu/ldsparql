import cors from 'cors';
import express from 'express';
import queue from 'express-queue';
import helmet from 'helmet';
import qs from 'qs';
import { longCache, noCache } from './cache-middleware.js';
import { activeQueryLimit } from './environment.js';
import browserRoute from './routes/browser.js';
import sparql from './routes/sparql.js';

const app = express();

app.set('query parser', function (str) {
  return qs.parse(str, { allowDots: true });
});

// http://expressjs.com/en/advanced/best-practice-security.html
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'base-uri': ["'self'", 'cdn.jsdelivr.net'],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'cdn.jsdelivr.net',
          'unpkg.com',
          'www.googletagmanager.com',
        ],
        'img-src': ["'self'", "'unsafe-eval'", 'cdn.jsdelivr.net', 'unpkg.com', 'www.googletagmanager.com'],
        'connect-src': ['*'],
      },
    },
  })
);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: 'text/*' }));
app.use(express.json());
app.set('json spaces', 2);

app.use('/', longCache, browserRoute);

const processingQueue = queue({ activeLimit: activeQueryLimit(), queuedLimit: -1 });
app.use('/', noCache, processingQueue, sparql);

export default app;
