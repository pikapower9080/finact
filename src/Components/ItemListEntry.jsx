import { useContext, useRef } from "react";
import { List, HStack, VStack, Text, Button, Avatar } from "rsuite";
import { GlobalState } from "../App";
import { formatTimestamp, getAlbumArt } from "../Util/Formatting";
import Icon from "./Icon";
import ItemContextMenu from "./ItemContextMenu";
import { playItem } from "../Util/Helpers";

export function ItemListEntry({ item, index, type, allItems, setSortable }) {
  const { queue, setQueue, setPlaybackState } = useContext(GlobalState);
  const moreButtonRef = useRef();

  return (
    <List.Item
      key={item.Id}
      index={index}
      className="pointer"
      onClick={async () => {
        playItem(setPlaybackState, setQueue, item, allItems);
      }}
    >
      <HStack spacing={15} alignItems="center">
        {type == "queue" && (
          <div
            onMouseEnter={() => {
              setSortable(true);
            }}
            onMouseLeave={() => {
              setSortable(false);
            }}
          >
            <Icon icon="drag_handle" style={{ color: "var(--rs-text-secondary)" }} noSpace />
          </div>
        )}
        {type == "album" && item.IndexNumber && <Text muted>{item.IndexNumber}</Text>}
        {type != "album" && <Avatar src={getAlbumArt(item, 160)} />}
        <VStack spacing={0}>
          <Text>{item.Name}</Text>
          {type == "album"
            ? item.Artists && item.Artists.length > 0 && <Text muted>{item.Artists.join(" / ")}</Text>
            : item.Album && (
                <Text as="a" href={`#albums/${item.AlbumId}`} muted onClick={(e) => e.stopPropagation()}>
                  {item.Album}
                </Text>
              )}
        </VStack>
        <HStack.Item alignSelf="flex-end" grow={1} style={{ display: "flex", justifyContent: "flex-end" }}>
          <VStack alignItems="center" style={{ marginRight: 5 }}>
            <Text style={{ marginBlock: "auto" }} muted>
              {formatTimestamp(item.RunTimeTicks / 10000000)}
            </Text>
          </VStack>
          {type == "queue" && (
            <Button
              appearance="subtle"
              className="square"
              onClick={(e) => {
                e.stopPropagation();
                setQueue((prevState) => {
                  const newItems = [...prevState.items];
                  newItems.splice(index, 1);
                  return { ...prevState, items: newItems };
                });
              }}
            >
              <Icon icon="remove_circle_outline" noSpace />
            </Button>
          )}
          <ItemContextMenu
            item={item}
            type={type}
            menuButton={
              <Button
                appearance="subtle"
                className="square"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Icon icon="more_vert" noSpace />
              </Button>
            }
          />
        </HStack.Item>
      </HStack>
    </List.Item>
  );
}
