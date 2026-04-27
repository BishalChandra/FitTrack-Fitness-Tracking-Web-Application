self.addEventListener('install', function(event) {
    console.log('Service Worker Installing');
    // Perform install steps
event.waitUntil(
    caches.open('my-cache')
        .then(function(cache) { 
            return cache.addAll([
                '/',
                '/index.html',  
            ]);
        })
);
});