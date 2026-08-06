/**
 * 자폭(self-destroying) 서비스워커 — 옛 빌드 잔재 청소 전용.
 *
 * 정식 워커는 /sw.js 하나뿐이다. 이 파일은 과거 배포가 다른 경로
 * (/service-worker.js)로 워커를 등록해 둔 기기를 위한 보험이다:
 * 그런 기기의 브라우저는 이 경로로 갱신 검사를 하는데, 예전에는 404 라
 * 옛 워커가 좀비로 남아 캐시된 옛 앱을 계속 서빙했다 ("고쳐도 계속
 * 옛날 화면" 사고의 기기측 원인). 이제는 이 자폭 워커가 설치되어
 * 캐시를 전부 지우고 자기 등록을 해제한 뒤 페이지를 새로 불러온다.
 *
 * 이후 방문부터는 새 앱의 ServiceWorkerRegistrar 가 /sw.js 를 정상
 * 등록한다. 이 파일은 지우지 말 것 — 지우면 아직 복구되지 않은 옛
 * 기기가 다시 좀비 상태로 남는다.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch {
        // 캐시 삭제 실패해도 등록 해제는 진행한다.
      }
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      await Promise.all(clients.map((client) => client.navigate(client.url)));
    })(),
  );
});
