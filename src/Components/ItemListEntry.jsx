import { useContext } from "react";
import { List, HStack, VStack, Text, Button, Avatar } from "rsuite";
import { GlobalState } from "../App";
import { formatTimestamp, getAlbumArt } from "../Util/Formatting";
import Icon from "./Icon";
import ItemContextMenu from "./ItemContextMenu";

export function ItemListEntry({ item, index, type, allItems }) {
  const { playbackState, setPlaybackState } = useContext(GlobalState);

  return (
    <List.Item
      key={item.Id}
      index={index}
      className="pointer"
      onClick={async () => {
        const newState = {
          item,
          playing: true,
          position: 0
        };

        if (allItems) {
          const itemIndex = allItems.findIndex((i) => i.Id === item.Id);
          newState.queue = { items: allItems, index: itemIndex };
          console.log(newState.queue);
        }
        setPlaybackState(newState);
      }}
    >
      <HStack spacing={15} alignItems="center">
        {type == "album" && item.IndexNumber && <Text muted>{item.IndexNumber}</Text>}
        {type != "album" && <Avatar src={getAlbumArt(item, 160)} />}
        <VStack>
          <Text>{item.Name}</Text>
          {type == "album"
            ? item.Artists && <Text muted>{item.Artists.join(" / ")}</Text>
            : item.Album && (
                <Text as="a" href={`/#albums/${item.AlbumId}`} muted onClick={(e) => e.stopPropagation()}>
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
          <ItemContextMenu
            item={item}
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
