// 카카오모빌리티 길찾기 API를 안전하게 호출하는 Vercel 서버리스 함수입니다.
export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) return response.status(503).json({ error: 'KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.' });

  const { origin, destination } = request.body ?? {};
  if (!origin || !destination) return response.status(400).json({ error: '출발지와 도착지 좌표가 필요합니다.' });

  try {
    const params = new URLSearchParams({ origin, destination, priority: 'RECOMMEND', alternatives: 'true', summary: 'true' });
    const upstream = await fetch(`https://apis-navi.kakaomobility.com/v1/directions?${params}`, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
    });
    if (!upstream.ok) throw new Error(`카카오 길찾기 응답 오류: ${upstream.status}`);
    const data = await upstream.json();
    const route = data.routes?.[0];
    if (!route) throw new Error('경로를 찾지 못했습니다.');
    return response.status(200).json({
      durationMinutes: Math.ceil(route.summary.duration / 60),
      distanceKm: (route.summary.distance / 1000).toFixed(1),
      toll: route.summary.fare?.toll ?? 0,
      path: (route.sections ?? []).flatMap((section) => (section.roads ?? []).flatMap((road) => road.vertexes ?? [])),
    });
  } catch (error) {
    return response.status(502).json({ error: error.message });
  }
}
