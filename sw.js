const CACHE_NAME='add-one-v6-sensory';
const CORE_ASSETS=[
  './',
  './index.html',
  './polish.css',
  './finishes.css',
  './finishes.js',
  './feel.css',
  './chill.css',
  './motion.css',
  './feel.js',
  './sound.js',
  './master-bank.json',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(CORE_ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;

  if(request.mode==='navigate'){
    const appIndex=new URL('./index.html',self.location.href);
    const appRoot=new URL('./',self.location.href);
    const cacheKey=url.pathname===appRoot.pathname||url.pathname===appIndex.pathname?'./index.html':request;
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(cacheKey,copy)).catch(()=>{}));
          }
          return response;
        })
        .catch(()=>caches.match(cacheKey).then(cached=>cached||caches.match('./index.html')))
    );
    return;
  }

  if(url.pathname.endsWith('/master-bank.json') || /\/(?:polish\.css|finishes\.css|finishes\.js|feel\.css|chill\.css|motion\.css|feel\.js|sound\.js)$/.test(url.pathname)){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
          return response;
        })
        .catch(()=>caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      return response;
    }))
  );
});
