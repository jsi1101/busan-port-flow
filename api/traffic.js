// Vercel 서버리스 함수: API 키를 브라우저에 노출하지 않습니다.
export default async function handler(request, response) {
  const apiKey = process.env.ITS_API_KEY;

  if (!apiKey) {
    return response.status(503).json({
      error: 'ITS_API_KEY 환경변수가 설정되지 않았습니다.',
    });
  }

  // 부산항 북항·감만/신선대와 도심 연결부를 포함하는 조회 범위입니다.
  const params = new URLSearchParams({
    apiKey,
    type: 'all',
    minX: '128.98',
    maxX: '129.15',
    minY: '35.03',
    maxY: '35.17',
    getType: 'json',
  });

  try {
    const upstream = await fetch(`https://openapi.its.go.kr:9443/trafficInfo?${params}`);
    if (!upstream.ok) throw new Error(`ITS API 응답 오류: ${upstream.status}`);

    const raw = await upstream.json();
    const items = raw?.body?.items ?? raw?.response?.body?.items?.item ?? [];
    const roads = Array.isArray(items) ? items : [items];
    const targetRoads = ['충장대로', '중앙대로', '부산항대교', '번영로'];

    const result = targetRoads.map((name) => {
      const matches = roads.filter((road) => road.roadName?.includes(name));
      const speed = matches.length
        ? Math.round(matches.reduce((sum, road) => sum + Number(road.speed || 0), 0) / matches.length)
        : null;
      return {
        name,
        speed,
        status: speed === null ? 'unknown' : speed < 15 ? 'congested' : speed <= 30 ? 'caution' : 'smooth',
        updatedAt: matches[0]?.createdDate ?? null,
      };
    });

    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return response.status(200).json({ roads: result, source: '국가교통정보센터 ITS', fetchedAt: new Date().toISOString() });
  } catch (error) {
    return response.status(502).json({ error: error.message });
  }
}
