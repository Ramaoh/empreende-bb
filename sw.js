/* Empreende BB: guarda os ERPs no aparelho para funcionar sem internet */
const CACHE='empreende-bb-v1';
const ARQS=['./','index.html','pizzaria.html','manifest-doces.webmanifest','manifest-pizzaria.webmanifest','icone-doces-192.png','icone-doces-512.png','icone-doces-maskable.png','icone-pizzaria-192.png','icone-pizzaria-512.png','icone-pizzaria-maskable.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // páginas: tenta a internet primeiro (para receber atualizações) e usa a cópia guardada se estiver sem conexão
  if(req.mode==='navigate'||(url.origin===location.origin&&url.pathname.endsWith('.html'))){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r}).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match(url.pathname.endsWith('pizzaria.html')?'pizzaria.html':'index.html'))));
    return;
  }
  // demais arquivos (ícones, fontes): usa a cópia guardada e busca na internet quando não houver
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res}).catch(()=>r)));
});
