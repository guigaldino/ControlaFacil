const cache = new Map();

const memoryCache = {
  get(key) {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }

    return entry.value;
  },

  set(key, value, ttlMs = 24 * 60 * 60 * 1000) { // Default 24 hours
    cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  },

  delete(key) {
    cache.delete(key);
  },

  clear() {
    cache.clear();
  }
};

module.exports = memoryCache;
