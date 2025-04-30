import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router";
import { Heading, Button, List, HStack, Avatar, Text, VStack, ButtonGroup, Stat, Image } from "rsuite";
import { jellyfinRequest } from "../../Util/Network";
import { getUser, LoadingContext } from "../../App";
import { formatSeconds, formatTimestamp, getAlbumArt } from "../../Util/Formatting";
import Icon from "../../Components/Icon";
import { PlaybackContext } from "../../App";
import { getStorage } from "../../storage";
import Spacer from "../../Components/Spacer";
import { ItemListEntry } from "../../Components/ItemListEntry";

const storage = getStorage();

export default function Album() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const { loading, setLoading } = useContext(LoadingContext);

  useEffect(() => {
    setLoading(true);
    const fetchPlaylistData = async () => {
      const responses = await Promise.all([jellyfinRequest(`/Items/${id}?UserId=${getUser().Id}`), jellyfinRequest(`/Users/${getUser().Id}/Items?ParentId=${id}&Fields=ItemCounts,PrimaryImageAspectRatio,CanDelete&SortBy=IndexNumber`)]);
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
          <HStack spacing={14} wrap>
            <Image style={{ height: "128px", borderRadius: "6px" }} src={`${storage.get("serverURL")}/Items/${id}/Images/Primary`} />
            <HStack.Item>
              <Heading level={3} style={{ marginLeft: 10 }}>
                {data.data.Name}
              </Heading>
              <HStack spacing={10} wrap>
                <Stat className="item-stat">
                  <Stat.Value value={data.data.ChildCount} />
                  <Stat.Label>Tracks</Stat.Label>
                </Stat>
                <Stat className="item-stat">
                  <Stat.Value>{formatSeconds(data.data.CumulativeRunTimeTicks / 10000000, true, false)}</Stat.Value>
                  <Stat.Label>Run Time</Stat.Label>
                </Stat>
                {data.data.ProductionYear && (
                  <Stat className="item-stat">
                    <Stat.Value>{data.data.ProductionYear}</Stat.Value>
                    <Stat.Label>Year</Stat.Label>
                  </Stat>
                )}
                {data.data.Genres && data.data.Genres.length > 0 && (
                  <Stat className="item-stat">
                    <Stat.Value>{data.data.Genres[0]}</Stat.Value>
                    <Stat.Label>Genre</Stat.Label>
                  </Stat>
                )}
              </HStack>
            </HStack.Item>
          </HStack>
          <Spacer height={10} />
          {/* {data.data.Overview && data.data.Overview.length > 0 && (
            <>
              <Text>{data.data.Overview}</Text>
              <Spacer height={10} />
            </>
          )} */}

          <Spacer height={10} />
          <List bordered hover /*sortable onSort={handleSortEnd}*/>
            {data.items.Items.map((item, index) => (
              <ItemListEntry item={item} index={index} type="album" key={item.Id} />
            ))}
          </List>
        </>
      ) : (
        ""
      )}
    </>
  );
}
