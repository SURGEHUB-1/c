const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(require('cors')());

app.post('/api/chat', async (req, res) => {
  console.log('--- New request ---');
  console.log('Messages received:', JSON.stringify(req.body.messages, null, 2));
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: req.body.messages || []
      })
    });

    const data = await response.json();
    console.log('OpenAI status:', response.status);
    console.log('OpenAI response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Unknown API error' });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.log('Crash error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
