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

export function formatTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = minutes < 10 ? `${minutes}` : minutes;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  return `${formattedMinutes}:${formattedSeconds}`;
}

export function formatSeconds(seconds, pretty = false, includeSeconds = true) {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let formattedTime = "";

  const pad = (num) => num.toString().padStart(2, "0");

  if (!pretty) {
    if (days > 0) formattedTime += `${days}:`;
    if (hours > 0 || days > 0) formattedTime += `${days > 0 ? pad(hours) : hours}:`;
    if (minutes > 0 || hours > 0 || days > 0) formattedTime += `${hours > 0 || days > 0 ? pad(minutes) : minutes}:`;
    if (includeSeconds) formattedTime += `${pad(seconds)}`;
  } else {
    if (days > 0) formattedTime += `${days}d `;
    if (hours > 0 || days > 0) formattedTime += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) formattedTime += `${minutes}m `;
    if (includeSeconds) formattedTime += `${seconds}s`;
  }

  // Remove any trailing colon or space
  return formattedTime.trim().replace(/[:\s]$/, "");
}
