// simple service worker cache
const STATIC_CACHE="static-v1";
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(["/","/manifest.json","/icon-192.png","/icon-512.png"])));
  self.skipWaiting();
});
self.addEventListener("activate",e=>{self.clients.claim()});
self.addEventListener("fetch",e=>{
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
});
