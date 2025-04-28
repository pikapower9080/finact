import EasyStorage from "@pikapower9080/easy-storage";

const storage = new EasyStorage({
  key: "finact"
});

const cacheStorage = new EasyStorage({
  key: "finact-cache",
  useSessionStorage: true
});

export function getStorage() {
  return storage;
}

export function getCacheStorage() {
  return cacheStorage;
}
