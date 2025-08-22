import EasyStorage from "@pikapower9080/easy-storage";
import localforage from "localforage";

export const asyncStorage = localforage.createInstance({
  name: "finact-async",
  storeName: "finact-async",
  driver: localforage.INDEXEDDB,
  version: 1.0,
  description: "Finact async storage"
});

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
