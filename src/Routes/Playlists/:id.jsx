import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router";
import { Heading, Button, Placeholder, List, HStack, Avatar, Text, VStack, ButtonGroup, Stat, Panel } from "rsuite";
import { jellyfinRequest } from "../../Util/Network";
import { getUser, LoadingContext } from "../../App";
import { formatSeconds, formatTimestamp, getAlbumArt } from "../../Util/Formatting";
import Icon from "../../Components/Icon";
import { PlaybackContext } from "../../App";
import { getStorage } from "../../storage";
import Spacer from "../../Components/Spacer";

const storage = getStorage();

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
              {formatTimestamp(item.RunTimeTicks / 10000000)}
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
      const responses = await Promise.all([jellyfinRequest(`/Items/${id}?UserId=${getUser().Id}`), jellyfinRequest(`/Users/${getUser().Id}/Items?ParentId=${id}&Fields=ItemCounts,PrimaryImageAspectRatio,CanDelete`)]);
      console.log(responses);
      setData({ data: responses[0], items: responses[1] });
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
          <HStack>
            <Avatar size="md" src={`${storage.get("serverURL")}/Items/${id}/Images/Primary`} />
            <Heading level={3}>{data.data.Name}</Heading>
          </HStack>
          <Spacer height={10} />
          {data.data.Overview && data.data.Overview.length > 0 && (
            <>
              <Text>{data.data.Overview}</Text>
              <Spacer height={10} />
            </>
          )}
          <HStack spacing={10}>
            <Stat bordered>
              <Stat.Value value={data.data.ChildCount} />
              <Stat.Label>Tracks</Stat.Label>
            </Stat>
            <Stat bordered>
              <Stat.Value>{formatSeconds(data.data.CumulativeRunTimeTicks / 10000000, true, false)}</Stat.Value>
              <Stat.Label>Run Time</Stat.Label>
            </Stat>
          </HStack>
          <Spacer height={10} />
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
