import { getStorage } from "../storage";
const storage = getStorage();

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
  if (!serverURL) {
    throw new Error("Server URL not set");
  }
  options.headers = {
    ...options.headers,
    "X-Emby-Authorization": `MediaBrowser Client="Finact", Device="Web", DeviceId="Web", Version="1.0.0"`
  };
  return fetchJSON(`${serverURL}${url}`, options);
}
