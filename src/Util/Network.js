import { getCacheStorage, getStorage } from "../storage";
import { getDeviceId } from "./Formatting";
const storage = getStorage();
const cacheStorage = getCacheStorage();

export async function fetchJSON(url, options = {}) {
  const result = await fetch(url, options);
  const json = await result.json();
  if (result.ok) {
    return json;
  } else {
    throw new Error(json);
  }
}

export async function jellyfinRequest(url, options = {}) {
  const serverURL = storage.get("serverURL");
  const accessToken = storage.get("AccessToken");
  if (!serverURL) {
    throw new Error("Server URL not set");
  }
  options.headers = {
    ...options.headers,
    Authorization: `MediaBrowser Client="Finact", Device="Web", DeviceId="${getDeviceId()}", Version="1.0.0"${accessToken && `, Token="${accessToken}"`}`
  };
  return fetchJSON(`${serverURL}${url}`, options);
}

export async function getLibrary(type) {
  if (cacheStorage.get(`library-${type}`)) {
    return cacheStorage.get(`library-${type}`);
  }
  const user = storage.get("User");
  if (!user || !user.Id) {
    throw new Error("Missing or invalid user");
  }
  const libraries = await jellyfinRequest("/UserViews?userId=" + storage.get("User").Id);
  console.log(libraries);
  const library = libraries.Items.filter((library) => library.CollectionType && library.CollectionType == type)[0];
  cacheStorage.set(`library-${type}`, library);
  return library;
}
