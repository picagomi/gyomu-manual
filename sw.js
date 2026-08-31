/* オフラインでも開けるようにするサービスワーカー
   HTML は「ネット優先」＝更新をすぐ反映。画像などは「キャッシュ優先」＝表示が速い。 */
const CACHE = 'genba-manual-v5';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
                './firebase-config.js', './cloud.js'];

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
  // 外部（FirebaseのSDKや通信）はブラウザに任せる
  if(new URL(req.url).origin !== location.origin) return;
  const isHTML = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').includes('text/html');
  // JS（アプリ本体・Firebaseの設定）も「ネット優先」。
  // ここをキャッシュ優先にすると、設定を変えても端末に届かなくなります。
  const isJS = new URL(req.url).pathname.endsWith('.js');

  if(isHTML || isJS){
    // ネット優先：新しい画面・設定をすぐ受け取る。オフラインならキャッシュ。
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put(isHTML ? './index.html' : req, copy)).catch(()=>{});
        return res;
      }).catch(()=> caches.match(isHTML ? './index.html' : req).then(hit=> hit || caches.match('./')))
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
