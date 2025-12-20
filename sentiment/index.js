/* jshint esversion: 8 */

const express = require('express');          // Task 2
const natural = require('natural');          // Task 1

const app = express();
const port = 3000;

// Initialize sentiment analyzer
const analyzer = new natural.SentimentAnalyzer(
  'English',
  natural.PorterStemmer,
  'afinn'
);

// Task 3: Create POST /sentiment endpoint
app.post('/sentiment', (req, res) => {
  try {
    // Task 4: Extract sentence from query params
    const { sentence } = req.query;

    if (!sentence) {
      return res.status(400).json({ error: 'Sentence parameter is required' });
    }

    const tokens = sentence.split(' ');
    const analysisResult = analyzer.getSentiment(tokens);

    // Task 5: Determine sentiment
    let sentiment = 'neutral';

    if (analysisResult < 0) {
      sentiment = 'negative';
    } else if (analysisResult > 0.33) {
      sentiment = 'positive';
    }

    // Task 6: Success response
    res.status(200).json({
      sentimentScore: analysisResult,
      sentiment: sentiment
    });

  } catch (error) {
    // Task 7: Error response
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

// Start the server (Task 2 continued)
app.listen(port, () => {
  console.log(`Sentiment server running on port ${port}`);
});
