import { Heading, Button, Placeholder, Row, Grid } from "rsuite";
import { getUser, GlobalState } from "../App";
import { useContext, useState, useEffect } from "react";
import { getLibrary } from "../Util/Network";
import ItemTile from "../Components/ItemTile";
import { playItem } from "../Util/Helpers";
import { getItems, getLatestMedia } from "../Client";
import type { BaseItemDto, BaseItemKind, BaseItemDtoQueryResult } from "../Client/index";

export default function Home() {
  return (
    <>
      <Heading level={3}>Home</Heading>
      <RecentlyAdded />
      <FrequentlyPlayed />
    </>
  );
}

export function RecentlyAdded() {
  const [recentItems, setRecentItems] = useState<BaseItemDto[] | null>(null);

  useEffect(() => {
    getLibrary("music").then((musicLibrary) => {
      getLatestMedia({
        query: {
          userId: getUser()?.Id,
          limit: 30,
          fields: ["PrimaryImageAspectRatio", "Path"],
          imageTypeLimit: 1,
          enableImageTypes: ["Primary"],
          parentId: musicLibrary.Id
        }
      }).then((recentItems) => {
        setRecentItems(recentItems.data!);
      });
    });
  }, []);

  return (
    <>
      {!recentItems ? (
        <Placeholder active />
      ) : (
        <>
          <Heading level={4}>Recently Added</Heading>
          <Grid fluid>
            <Row gutter={16}>
              {recentItems.map((item, index) => (
                <ItemTile
                  item={item}
                  tileProps={{ onClick: () => (window.location.hash = `#albums/${item.Id}`), className: "pointer" }}
                  key={item.Id}
                />
              ))}
            </Row>
          </Grid>
        </>
      )}
    </>
  );
}

export function FrequentlyPlayed() {
  const [frequentlyPlayed, setFrequentlyPlayed] = useState<BaseItemDtoQueryResult | null>(null);
  const { setQueue, setPlaybackState } = useContext(GlobalState);

  useEffect(() => {
    getLibrary("music").then((musicLibrary) => {
      getItems({
        query: {
          userId: getUser()?.Id,
          sortBy: ["PlayCount"],
          sortOrder: ["Descending"],
          includeItemTypes: ["Audio"],
          limit: 10,
          recursive: true,
          fields: ["PrimaryImageAspectRatio"],
          filters: ["IsPlayed"],
          parentId: musicLibrary.Id,
          imageTypeLimit: 1,
          enableImageTypes: ["Primary", "Backdrop", "Banner", "Thumb"],
          enableTotalRecordCount: false
        }
      }).then((frequentlyPlayedItems) => {
        setFrequentlyPlayed(frequentlyPlayedItems.data!);
      });
    });
  }, []);

  return (
    <>
      {!frequentlyPlayed || !frequentlyPlayed.Items ? (
        <Placeholder active />
      ) : (
        <>
          <Heading level={4}>Frequently Played</Heading>
          <Grid fluid>
            <Row gutter={16}>
              {frequentlyPlayed.Items.map((item, index) => (
                <ItemTile
                  item={item}
                  tileProps={{
                    onClick: () => {
                      playItem(setPlaybackState, setQueue, item, frequentlyPlayed.Items);
                    },
                    className: "pointer"
                  }}
                  key={item.Id}
                />
              ))}
            </Row>
          </Grid>
        </>
      )}
    </>
  );
}
