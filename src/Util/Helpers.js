import { useContext } from "react";
import { GlobalState } from "../App";

export function playItem(setPlaybackState, setQueue, item, allItems) {
  let queue;
  if (!allItems) {
    queue = {
      items: [item],
      index: 0
    };
  } else {
    queue = {
      items: allItems,
      index: allItems.findIndex((x) => x.Id == item.Id)
    };
  }
  setPlaybackState({
    item,
    position: 0,
    playing: true
  });
  setQueue(queue);
}

function getIsElectron() {
  // Renderer process
  if (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") {
    return true;
  }

  // Main process
  if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to false
  if (typeof navigator === "object" && typeof navigator.userAgent === "string" && navigator.userAgent.indexOf("Electron") >= 0) {
    return true;
  }

  return false;
}

export const isElectron = getIsElectron();
