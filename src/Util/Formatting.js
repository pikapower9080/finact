import { getStorage } from "../storage";

const storage = getStorage();

export function getAlbumArt(item, size) {
  const params = {};
  if (size) {
    params.fillWidth = size;
    params.fillHeight = size;
  }
  const queryString = new URLSearchParams(params).toString();
  if ("Primary" in item.ImageTags) {
    return `${storage.get("serverURL")}/Items/${item.Id}/Images/Primary?${queryString}`;
  } else {
    return `${storage.get("serverURL")}/Items/${item.AlbumId}/Images/Primary?${queryString}`;
  }
}

export function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = minutes < 10 ? `${minutes}` : minutes;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  return `${formattedMinutes}:${formattedSeconds}`;
}
