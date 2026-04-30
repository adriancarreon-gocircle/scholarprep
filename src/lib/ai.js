const CLAUDE_API_URL = '/api/claude';
const callClaude = async (systemPrompt, userPrompt) => {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt })
  });
  const data = await response.json();
  return data.text;
};