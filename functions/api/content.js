const DEFAULT_CONTENT = {
  photoUrl: 'https://example.com/event-gallery',
  schedule: {
    '20': [['14:00', 'Hotel Check-in', 'Lobby · Level 1'], ['18:30', 'Welcome Reception', 'Sky Lounge · Level 38']],
    '21': [['09:00', 'Welcome & Opening', 'Grand Ballroom · Level 3'], ['09:15', 'Study Overview & Objectives', 'ELASCOPE / ELFIDENCE Program'], ['10:30', 'Coffee Break', 'Ballroom Foyer'], ['11:00', 'Protocol & Eligibility', 'Presented by Global Medical Team'], ['12:30', 'Networking Lunch', 'Jade Restaurant · Level 2'], ['14:00', 'Safety Reporting Workshop', 'Grand Ballroom · Level 3']],
    '22': [['07:00', 'Breakfast', 'Jade Restaurant · Level 2'], ['09:00', 'Optional Site Discussions', 'Meeting Room 5 · Level 3'], ['12:00', 'Departure', 'Transfers leave from hotel lobby']]
  },
  hotel: { name: 'Mandarin Oriental Pudong, Shanghai', address: '111 Pudong South Road, Pudong New Area, Shanghai', mapUrl: 'https://maps.apple.com/?q=Mandarin+Oriental+Pudong+Shanghai', venue: 'Grand Ballroom · Level 3', wifi: 'IPSEN_ICON_GUEST', password: 'Shanghai2026', breakfast: '06:30–10:30 · Jade Restaurant, Level 2', frontDesk: '24 hours · Dial 0 from your room' }
};

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function onRequestGet({ env }) {
  if (!env.EVENT_DATA) return json(DEFAULT_CONTENT);
  const saved = await env.EVENT_DATA.get('public-content', 'json');
  return json(saved || DEFAULT_CONTENT);
}

export async function onRequestPut({ request, env }) {
  if (!env.EVENT_DATA) return json({ error: 'EVENT_DATA KV binding is not configured' }, 503);
  let data;
  try { data = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  if (!data || typeof data !== 'object' || !data.schedule || !data.hotel) return json({ error: 'Invalid content payload' }, 400);
  await env.EVENT_DATA.put('public-content', JSON.stringify(data));
  return json({ ok: true });
}
