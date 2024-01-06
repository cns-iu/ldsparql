import { Wayne } from '@jcubic/wayne';
import ldsparqlRoutes from './ldsparql.js';

const app = new Wayne();

ldsparqlRoutes(app);

export default app;
