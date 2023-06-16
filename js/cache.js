const CACHE = {
  cacheName: null,
  init(name) {
    CACHE.cacheName = name;
  },
  open() {
    return caches.open(CACHE.cacheName);
  },
  delete(filename) {
    return CACHE.open().then((cache) => {
      return cache.delete(filename);
    });
  },
  keys() {
    return CACHE.open().then((cache) => {
      return cache.keys();
    });
  },
  match(url) {
    return CACHE.open().then((cache) => {
      return cache.match(url);
    });
  },
  put(response) {
    return CACHE.open().then((cache) => {
      let name = response.headers.get("X-file");
      let url = new URL(`/${Date.now()}/${name}`, location.origin);
      return cache.put(url, response);
    });
  },
};

export default CACHE;
