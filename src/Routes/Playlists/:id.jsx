import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router";
import { Heading, Button, Placeholder, List, HStack, Avatar, Text, VStack, ButtonGroup } from "rsuite";
import { jellyfinRequest } from "../../Util/Network";
import { getUser, LoadingContext } from "../../App";
import { formatSeconds, getAlbumArt } from "../../Util/Formatting";
import Icon from "../../Components/Icon";
import { PlaybackContext } from "../../App";

function PlaylistItem({ item, index }) {
  const { playbackState, setPlaybackState } = useContext(PlaybackContext);

  return (
    <List.Item
      key={item.Id}
      index={index}
      className="pointer"
      onClick={async () => {
        setPlaybackState({
          item,
          playing: true,
          position: 0
        });
      }}
    >
      <HStack spacing={15} alignItems="center">
        <Avatar src={getAlbumArt(item, 160)} />
        <VStack>
          <Text>{item.Name}</Text>
          {item.Album && <Text muted>{item.Album}</Text>}
        </VStack>
        <HStack.Item alignSelf="flex-end" grow={1} style={{ display: "flex", justifyContent: "flex-end" }}>
          <VStack alignItems="center" style={{ marginRight: 5 }}>
            <Text style={{ marginBlock: "auto" }} muted>
              {formatSeconds(item.RunTimeTicks / 10000000)}
            </Text>
          </VStack>
          <ButtonGroup>
            <Button appearance="subtle" className="square">
              <Icon icon="more_vert" noSpace />
            </Button>
          </ButtonGroup>
        </HStack.Item>
      </HStack>
    </List.Item>
  );
}

export default function Playlist() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const { loading, setLoading } = useContext(LoadingContext);

  useEffect(() => {
    setLoading(true);
    const fetchPlaylistData = async () => {
      const data = await jellyfinRequest(`/Items/${id}?UserId=${getUser().Id}`);
      console.log(data);
      const items = await jellyfinRequest(`/Users/${getUser().Id}/Items?ParentId=${id}&Fields=ItemCounts,PrimaryImageAspectRatio,CanDelete`);
      setData({ data, items });
      setLoading(false);
    };

    fetchPlaylistData();
  }, []);

  const handleSortEnd = ({ oldIndex, newIndex }) =>
    setData((prvData) => {
      const moveData = prvData.items.Items.splice(oldIndex, 1);
      const newData = [...prvData.items.Items];
      newData.splice(newIndex, 0, moveData[0]);
      return { items: { ...data.items, Items: newData }, data: prvData.data };
    }, []);

  return (
    <>
      {data ? (
        <>
          <Heading level={3}>{data.data.Name}</Heading>
          <List bordered hover /*sortable onSort={handleSortEnd}*/>
            {data.items.Items.map((item, index) => (
              <PlaylistItem item={item} index={index} key={item.Id} />
            ))}
          </List>
        </>
      ) : (
        ""
      )}
    </>
  );
}
