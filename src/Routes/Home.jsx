import { Heading, Button, Placeholder, Row, Grid } from "rsuite";
import { getUser, GlobalState } from "../App";
import { useContext, useState, useEffect } from "react";
import { jellyfinRequest, getLibrary } from "../Util/Network";
import ItemTile from "../Components/ItemTile";

export default function Home() {
  const { playbackState, setPlaybackState } = useContext(GlobalState);

  return (
    <>
      <Heading level={3}>Home</Heading>

      <Button
        onClick={async () => {
          const songData = await jellyfinRequest("/Items/fce1da10f97804a8fb589323d17518db");
          console.log(songData);
          setPlaybackState({
            item: songData,
            playing: true,
            position: 0
          });
        }}
      >
        Play some funky music 🎺
      </Button>
      <RecentlyAdded />
      <FrequentlyPlayed />
    </>
  );
}

export function RecentlyAdded() {
  const [recentItems, setRecentItems] = useState(null);

  useEffect(() => {
    getLibrary("music").then((musicLibrary) => {
      const query = {
        Limit: 30,
        Fields: ["PrimaryImageAspectRatio", "Path"],
        ImageTypeLimit: 1,
        EnableImageTypes: ["Primary"],
        ParentId: musicLibrary.Id
      };

      const params = new URLSearchParams();
      for (const key in query) params.set(key, query[key]);

      jellyfinRequest(`/Users/${getUser().Id}/Items/Latest?${params.toString()}`).then((recentItems) => {
        setRecentItems(recentItems);
      });
    });
  }, []);

  return (
    <>
      {!recentItems ? (
        <Placeholder active width={100} height={100} />
      ) : (
        <>
          <Heading level={4}>Recently Added</Heading>
          <Grid fluid>
            <Row gutter={16}>
              {recentItems.map((item, index) => (
                <ItemTile item={item} tileProps={{ onClick: () => (window.location.href = `/#albums/${item.Id}`), className: "pointer" }} key={item.Id} />
              ))}
            </Row>
          </Grid>
        </>
      )}
    </>
  );
}

export function FrequentlyPlayed() {
  const [frequentlyPlayed, setFrequentlyPlayed] = useState();
  const { playbackState, setPlaybackState } = useContext(GlobalState);

  useEffect(() => {
    getLibrary("music").then((musicLibrary) => {
      const query = {
        SortBy: "PlayCount",
        SortOrder: "Descending",
        IncludeItemTypes: "Audio",
        Limit: 10,
        Recursive: true,
        Fields: ["PrimaryImageAspectRatio"],
        Filters: ["IsPlayed"],
        ParentId: musicLibrary.Id,
        ImageTypeLimit: 1,
        EnableImageTypes: ["Primary", "Backdrop", "Banner", "Thumb"],
        EnableTotalRecordCount: false
      };

      const params = new URLSearchParams();
      for (const key in query) params.set(key, query[key]);

      jellyfinRequest(`/Users/${getUser().Id}/Items?${params.toString()}`).then((frequentlyPlayedItems) => {
        setFrequentlyPlayed(frequentlyPlayedItems);
      });
    });
  }, []);

  return (
    <>
      {!frequentlyPlayed ? (
        <Placeholder active width={100} height={100} />
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
                      setPlaybackState({
                        item,
                        playing: true,
                        position: 0
                      });
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
