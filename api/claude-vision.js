export const config = {
  maxDuration: 120,
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { base64Image, mediaType, images, systemPrompt, userPrompt } = req.body;

    // Build content array — supports either the original single-image fields
    // (base64Image/mediaType, still used by scanAnswerSheet etc.) or a new
    // "images" array of { base64Image, mediaType } for multi-photo requests
    // (e.g. a reading passage on one photo and its questions on another).
    // Capped at 5 images per call to keep payload/cost sane.
    const content = [];
    const imageList = Array.isArray(images) && images.length > 0
      ? images
      : (base64Image ? [{ base64Image, mediaType }] : []);
    imageList.slice(0, 5).forEach(img => {
      if (!img?.base64Image) return;
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: img.mediaType || 'image/jpeg', data: img.base64Image }
      });
    });
    content.push({ type: 'text', text: userPrompt });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content?.map(c => c.text || '').join('') || '';
    res.json({ text: text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}