const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for frontend requests

// In-memory store for URLs
const urlDatabase = new Map();

// Helper function to create a random path
const generateShortId = () => crypto.randomBytes(8).toString('hex');

// Route to shorten URLs
app.post('/api/shorten', (req, res) => {
  const { originalUrl } = req.body;

  // Validate URL
  try {
    new URL(originalUrl); // Throws error if invalid
  } catch (_) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Generate a unique short ID
  const shortId = generateShortId();
  urlDatabase.set(shortId, originalUrl);

  // Send the shortened URL
  res.json({ shortUrl: `http://localhost:5000/${shortId}` });
});


// Route to redirect to the original URL
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlDatabase.get(shortId);

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

// Route to check if URL is detected by Facebook
app.get('/api/check-url/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlDatabase.get(shortId);

  if (originalUrl) {
    // Return some obfuscated response to avoid detection
    res.json({ obfuscatedResponse: `You are being redirected to a URL` });
  } else {
    res.status(404).send('URL not found');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
