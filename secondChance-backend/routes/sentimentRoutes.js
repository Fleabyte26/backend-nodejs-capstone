const express = require('express');
const natural = require('natural');

const router = express.Router();

const analyzer = new natural.SentimentAnalyzer(
  'English',
  natural.PorterStemmer,
  'afinn'
);

router.post('/', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const tokens = text.split(' ');
  const score = analyzer.getSentiment(tokens);

  let sentiment = 'neutral';
  if (score > 0) sentiment = 'positive';
  if (score < 0) sentiment = 'negative';

  res.json({ text, score, sentiment });
});

module.exports = router;
