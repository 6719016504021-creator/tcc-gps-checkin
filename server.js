import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Setting up paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (html, css, js) from the current directory
app.use(express.static(__dirname));

// Main route: serve index.html when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📂 Serving files from: ${__dirname}`);
});
