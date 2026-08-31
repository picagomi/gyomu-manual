/* オフラインでも開けるようにするサービスワーカー
   HTML は「ネット優先」＝更新をすぐ反映。画像などは「キャッシュ優先」＝表示が速い。 */
const CACHE = 'genba-manual-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(ASSETS)).then(()=> self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=> Promise.all(ks.filter(k=> k !== CACHE).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const isHTML = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').includes('text/html');

  if(isHTML){
    // ネット優先：新しいマニュアル画面をすぐ受け取る。オフラインならキャッシュ。
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put('./index.html', copy)).catch(()=>{});
        return res;
      }).catch(()=> caches.match('./index.html').then(hit=> hit || caches.match('./')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=> c.put(req, copy)).catch(()=>{});
      return res;
    }))
  );
});
