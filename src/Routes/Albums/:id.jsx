import { useEffect, useState, useContext, Fragment } from "react";
import { useParams } from "react-router";
import { Heading, List, HStack, Stat, Image, FlexboxGrid } from "rsuite";
import { jellyfinRequest } from "../../Util/Network";
import { getUser, GlobalState } from "../../App";
import { formatSeconds } from "../../Util/Formatting";
import { getStorage } from "../../storage";
import Spacer from "../../Components/Spacer";
import { ItemListEntry } from "../../Components/ItemListEntry";
import ItemListActions from "../../Components/ItemListActions";

const storage = getStorage();

function getDiscGroups(items) {
  let hasDiscs = false;
  let discNumbers = [];
  let discs = [];
  items.forEach((item) => {
    if (item.ParentIndexNumber) {
      hasDiscs = true;
      if (!discNumbers.includes(item.ParentIndexNumber)) {
        discNumbers.push(item.ParentIndexNumber);
      }
    }
  });
  if (hasDiscs) {
    discNumbers.forEach((discNumber) => {
      discs[discNumber] = items.filter((item) => item.ParentIndexNumber === discNumber);
    });
    return discs;
  } else {
    return [items];
  }
}

export default function Album() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const { loading, setLoading } = useContext(GlobalState);

  useEffect(() => {
    setLoading(true);
    const fetchPlaylistData = async () => {
      const responses = await Promise.all([jellyfinRequest(`/Items/${id}?UserId=${getUser().Id}`), jellyfinRequest(`/Users/${getUser().Id}/Items?ParentId=${id}&Fields=ItemCounts,PrimaryImageAspectRatio,CanDelete&SortBy=IndexNumber`)]);
      setData({ data: responses[0], discs: getDiscGroups(responses[1].Items) });
      setLoading(false);
    };

    fetchPlaylistData();
  }, [id]);

  return (
    <>
      {data ? (
        <>
          <HStack spacing={14} wrap>
            <Image style={{ height: "128px", borderRadius: "6px" }} src={`${storage.get("serverURL")}/Items/${id}/Images/Primary`} />
            <HStack.Item style={{ flexGrow: "1" }}>
              <FlexboxGrid style={{ width: "100%" }} align="middle" justify="space-between">
                <Heading level={3} style={{ marginLeft: 10 }}>
                  {data.data.Name}
                </Heading>
                <ItemListActions items={data.discs.flat()} type="album" parent={data.data} />
              </FlexboxGrid>
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
          {/* <Spacer height={10} /> */}
          {/* {data.data.Overview && data.data.Overview.length > 0 && (
            <>
              <Text>{data.data.Overview}</Text>
              <Spacer height={10} />
            </>
          )} */}

          <Spacer height={10} />

          {data.discs.map((discItems, index) => {
            if (!discItems || discItems.length === 0) {
              return null;
            }
            return (
              <Fragment key={index}>
                {data.discs.filter((x) => x != null).length > 1 && (
                  <>
                    <Heading level={4}>Disc {index}</Heading>
                  </>
                )}
                <Spacer height={5} />
                <List bordered hover /*sortable onSort={handleSortEnd}*/>
                  {discItems.map((item, index) => (
                    <ItemListEntry item={item} index={index} type="album" allItems={data.discs.flat()} key={item.Id} />
                  ))}
                </List>
                <Spacer height={5} />
              </Fragment>
            );
          })}
        </>
      ) : (
        ""
      )}
    </>
  );
}
