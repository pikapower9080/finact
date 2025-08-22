import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router";
import { Heading, List, HStack, Avatar, Text, Stat, FlexboxGrid } from "rsuite";
import { getUser, GlobalState } from "../../App";
import { formatSeconds } from "../../Util/Formatting";
import { getStorage } from "../../storage";
import Spacer from "../../Components/Spacer";
import { ItemListEntry } from "../../Components/ItemListEntry";
import ItemListActions from "../../Components/ItemListActions";
import { getItem, getItems } from "../../Client/index";
import type { BaseItemDtoQueryResult, BaseItemDto } from "../../Client/index";
import Icon from "../../Components/Icon";

const storage = getStorage();

export default function Playlist() {
  const { id } = useParams();

  const [data, setData] = useState<{
    data: BaseItemDto;
    items: BaseItemDtoQueryResult;
  } | null>(null);

  const { loading, setLoading } = useContext(GlobalState);

  const fetchPlaylistData = async () => {
    const responses = await Promise.all([
      getItem({
        path: { itemId: id! },
        query: { userId: getUser()?.Id }
      }),
      getItems({
        query: {
          parentId: id,
          fields: ["ItemCounts", "PrimaryImageAspectRatio", "CanDelete"]
        }
      })
    ]);
    setData({ data: responses[0].data!, items: responses[1].data! });
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchPlaylistData();
  }, [id]);

  return (
    <>
      {data && data.data && data.items ? (
        <>
          <FlexboxGrid align="middle" justify="space-between">
            <HStack>
              <Avatar size="md" src={`${storage.get("serverURL")}/Items/${id}/Images/Primary`}>
                <Icon icon="playlist_play" noSpace />
              </Avatar>
              <Heading level={3}>{data.data.Name}</Heading>
            </HStack>
            <ItemListActions items={data.items.Items!} parent={data.data} />
          </FlexboxGrid>
          <Spacer height={10} />
          {data.data.Overview && data.data.Overview.length > 0 && (
            <>
              <Text>{data.data.Overview}</Text>
              <Spacer height={10} />
            </>
          )}
          <HStack spacing={10}>
            <Stat bordered>
              <Stat.Value value={data.data.ChildCount!} />
              <Stat.Label>Tracks</Stat.Label>
            </Stat>
            <Stat bordered>
              <Stat.Value>{formatSeconds(data.data.CumulativeRunTimeTicks! / 10000000, true, false)}</Stat.Value>
              <Stat.Label>Run Time</Stat.Label>
            </Stat>
          </HStack>

          <Spacer height={10} />
          <List bordered hover /*sortable onSort={handleSortEnd}*/>
            {data.items.Items!.map((item, index) => (
              <ItemListEntry
                item={item}
                index={index}
                allItems={data.items.Items}
                type="playlist"
                parentId={id}
                key={item.Id}
                refresh={fetchPlaylistData}
              />
            ))}
          </List>
        </>
      ) : (
        ""
      )}
    </>
  );
}
