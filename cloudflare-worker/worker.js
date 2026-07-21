const ALLOWED_ORIGIN = 'https://amurad203.github.io';

const LABELS = {
  when: 'When',
  time: 'Time',
  where: 'Where',
  activity: 'Activities',
  food: 'Food',
  drink: 'Drinks',
  flowers: 'Flowers',
  chocolate: 'Chocolate',
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders() });
    }

    let body = '';
    for (const key in LABELS) {
      const val = data[key];
      const display = Array.isArray(val) ? val.join(', ') : (val || '-');
      body += `**${LABELS[key]}:** ${display}\n`;
    }

    const ghRes = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'date-page-worker',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Her Perfect Date Answers 💕',
        body,
        labels: ['date-answers'],
      }),
    });

    if (!ghRes.ok) {
      return new Response('Failed to save', { status: 502, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  },
};
