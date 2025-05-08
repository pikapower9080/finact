import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router";
import { Heading, List, HStack, Avatar, Text, Stat } from "rsuite";
import { jellyfinRequest } from "../../Util/Network";
import { getUser, GlobalState } from "../../App";
import { formatSeconds } from "../../Util/Formatting";
import { getStorage } from "../../storage";
import Spacer from "../../Components/Spacer";
import { ItemListEntry } from "../../Components/ItemListEntry";

const storage = getStorage();

export default function Playlist() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const { loading, setLoading } = useContext(GlobalState);

  useEffect(() => {
    setLoading(true);
    const fetchPlaylistData = async () => {
      const responses = await Promise.all([jellyfinRequest(`/Items/${id}?UserId=${getUser().Id}`), jellyfinRequest(`/Users/${getUser().Id}/Items?ParentId=${id}&Fields=ItemCounts,PrimaryImageAspectRatio,CanDelete`)]);
      setData({ data: responses[0], items: responses[1] });
      setLoading(false);
    };

    fetchPlaylistData();
  }, [id]);

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
              <ItemListEntry item={item} index={index} allItems={data.items.Items} key={item.Id} />
            ))}
          </List>
        </>
      ) : (
        ""
      )}
    </>
  );
}
