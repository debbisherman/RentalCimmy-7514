import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Path to the built assets
const distPath = path.join(__dirname, 'dist');

/**
 * LOGGING & DIAGNOSTICS
 * Helps you see if the files actually exist on the server
 */
if (!fs.existsSync(distPath)) {
  console.error('❌ ERROR: "dist" folder not found! Please run "npm run build" first.');
} else {
  console.log('✅ Found "dist" folder.');
  const files = fs.readdirSync(distPath);
  console.log('📁 Files in dist:', files.join(', '));
}

// 1. Serve static files with strict MIME types
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// 2. Catch-all: Send index.html for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Please run npm run build.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port: ${PORT}`);
});