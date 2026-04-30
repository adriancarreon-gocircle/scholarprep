export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { systemPrompt, userPrompt } = req.body;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });
  const data = await response.json();
  const text = data.content?.map(c => c.text || '').join('') || '';
  res.json({ text: text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() });
}