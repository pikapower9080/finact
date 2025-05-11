import { useContext, useEffect, useRef, useState } from "react";
import { Card, FlexboxGrid, List, Text, VStack } from "rsuite";
import { GlobalState } from "../App";
import Icon from "../Components/Icon";
import { getCacheStorage } from "../storage";
import { jellyfinRequest } from "../Util/Network";
import { ItemListEntry } from "../Components/ItemListEntry";
import Fallback from "../Components/Fallback";

const cacheStorage = getCacheStorage();

export default function Queue() {
  const { playbackState, setPlaybackState, queue, setQueue } = useContext(GlobalState);

  const handleSortEnd = ({ oldIndex, newIndex }) =>
    setQueue(() => {
      const moveData = queue.items.splice(oldIndex, 1);
      const newData = [...queue.items];
      newData.splice(newIndex, 0, moveData[0]);
      console.log({ ...queue, items: newData });
      return { ...queue, items: newData };
    }, []);

  return (
    <div className="queue">
      {!queue || !("items" in queue) || queue.items.length == 0 ? (
        <Fallback icon="queue_music" text="Queue is empty" />
      ) : (
        <>
          <List bordered sortable hover onSort={handleSortEnd} pressDelay={200}>
            {queue.items.map((item, index) => {
              return <ItemListEntry item={item} type="queue" index={index} key={item.Id} allItems={queue.items} />;
            })}
          </List>
        </>
      )}
    </div>
  );
}
