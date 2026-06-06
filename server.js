const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Rota da API intermediária
app.post('/api/gerar', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { system, messages, max_tokens } = req.body;

  if (!messages || !messages.length) {
    return res.status(400).json({ error: 'Mensagem obrigatoria' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave de API nao configurada' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1500,
        system: system || '',
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erro na API' });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Simplifica Ai rodando na porta ${PORT}`);
});
