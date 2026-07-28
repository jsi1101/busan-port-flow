import https from 'node:https';

function requestIts(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 15000 }, (upstream) => {
      const chunks = [];
      upstream.on('data', (chunk) => chunks.push(chunk));
      upstream.on('end', () => {
        if (upstream.statusCode < 200 || upstream.statusCode >= 300) {
          reject(new Error(`ITS API response: ${upstream.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          reject(new Error('ITS API returned invalid JSON'));
        }
      });
    });
    request.on('timeout', () => request.destroy(new Error('ITS API timed out')));
    request.on('error', reject);
  });
}

export default async function handler(request, response) {
  const apiKey = process.env.ITS_API_KEY;
  if (!apiKey) return response.status(503).json({ error: 'ITS_API_KEY is not configured.' });

  const query = new URLSearchParams({
    apiKey, type: 'all', minX: '128.98', maxX: '129.15',
    minY: '35.03', maxY: '35.17', getType: 'json',
  });
  const monitoredRoads = [
    { name: '\uCDA9\uC7A5\uB300\uB85C', aliases: ['\uCDA9\uC7A5\uB300\uB85C'] },
    { name: '\uC911\uC559\uB300\uB85C', aliases: ['\uC911\uC559\uB300\uB85C'] },
    { name: '\uBD80\uC0B0\uD56D\uB300\uAD50', aliases: ['\uBD80\uC0B0\uD56D\uB300\uAD50'] },
    { name: '\uBC88\uC601\uB85C', aliases: ['\uBC88\uC601\uB85C'] },
  ];

  try {
    const raw = await requestIts(`https://openapi.its.go.kr:9443/trafficInfo?${query}`);
    const items = raw?.body?.items ?? raw?.response?.body?.items?.item ?? [];
    const roads = Array.isArray(items) ? items : [items];
    const result = monitoredRoads.map(({ name, aliases }) => {
      const matches = roads.filter((road) => aliases.some((alias) => road.roadName?.includes(alias)));
      const speed = matches.length ? Math.round(matches.reduce((total, road) => total + Number(road.speed || 0), 0) / matches.length) : null;
      return { name, speed, status: speed === null ? 'unknown' : speed < 15 ? 'congested' : speed <= 30 ? 'caution' : 'smooth', updatedAt: matches[0]?.createdDate ?? null };
    });
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return response.status(200).json({ roads: result, source: 'ITS', fetchedAt: new Date().toISOString() });
  } catch (error) {
    return response.status(502).json({ error: error.message });
  }
}
