'use strict';
// 인터뷰어 도우미 서비스 워커: 앱 파일만 캐시합니다. 입력 내용은 다루지 않습니다.
const CACHE='interview-helper-v2.1';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// 캐시 우선 + 백그라운드 갱신: 오프라인에서도 바로 열리고, 온라인이면 다음 실행 때 새 버전이 반영됩니다.
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  e.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(req,{ignoreSearch:true});
    const fresh=fetch(req).then(res=>{if(res&&res.ok&&res.type==='basic')cache.put(req,res.clone());return res;}).catch(()=>null);
    if(cached){e.waitUntil(fresh);return cached;}
    return (await fresh)||new Response('오프라인 상태입니다. 온라인에서 한 번 열어 주세요.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));
});
