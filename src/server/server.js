import app from './app.js';
import { port } from './environment.js';
import './fetch-polyfill.js';

// Start the server
const PORT = port();
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});
