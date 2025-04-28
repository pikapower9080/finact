import EasyStorage from "@pikapower9080/easy-storage";

const storage = new EasyStorage({
  key: "finact"
});

export function getStorage() {
  return storage;
}
