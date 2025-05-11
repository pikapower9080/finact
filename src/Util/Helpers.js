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
