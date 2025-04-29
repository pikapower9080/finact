import { useEffect, useState } from "react";
import { Col, Grid, Heading, Image, Placeholder, Row } from "rsuite";
import { getLibrary, jellyfinRequest } from "../Util/Network";
import { getUser } from "../App";
import { getStorage } from "../storage";
import ItemTile from "../Components/ItemTile";

const storage = getStorage();

export default function Playlists() {
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    getLibrary("playlists").then((playlistsLibrary) => {
      jellyfinRequest(`/Users/${getUser().Id}/Items?StartIndex=0&Limit=100&Fields=PrimaryImageAspectRatio,SortName,Path,ChildCount&ImageTypeLimit=1&ParentId=${playlistsLibrary.Id}&SortBy=IsFolder,SortName&SortOrder=Ascending`).then((playlists) => {
        setPlaylists(playlists);
      });
    });
  }, []);

  return (
    <>
      {!playlists ? (
        <Placeholder.Graph active width={100} height={100} />
      ) : (
        <>
          <Heading level={3}>Playlists</Heading>
          <Grid fluid>
            <Row gutter={16}>
              {playlists.Items.map((item, index) => (
                <ItemTile item={item} key={item.Id} tileProps={{ onClick: () => (window.location.href = `/#playlists/${item.Id}`), className: "pointer" }} />
              ))}
            </Row>
          </Grid>
        </>
      )}
    </>
  );
}
