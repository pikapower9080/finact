import { useContext, useEffect, useState } from "react";
import { Grid, Heading, Row } from "rsuite";
import { getLibrary, jellyfinRequest } from "../Util/Network";
import { getUser, GlobalState } from "../App";
import { getStorage } from "../storage";
import ItemTile from "../Components/ItemTile";
import Fallback from "../Components/Fallback";

const storage = getStorage();

export default function Playlists() {
  const [playlists, setPlaylists] = useState(null);
  const { loading, setLoading } = useContext(GlobalState);
  const [error, setError] = useState(false);
  const [errorIcon, setErrorIcon] = useState("apps_outage");

  useEffect(() => {
    function handleError(err) {
      console.error(err);
      setLoading(false);
      if (err.toString().includes("not found")) {
        setError("No playlists yet");
        setErrorIcon("search_off");
      } else if (err.toString().includes("NetworkError")) {
        setError("Network error");
        setErrorIcon("wifi_off");
      } else {
        setError("Failed to load playlists");
      }
    }

    setLoading(true);
    getLibrary("playlists")
      .then((playlistsLibrary) => {
        jellyfinRequest(`/Users/${getUser().Id}/Items?StartIndex=0&Limit=100&Fields=PrimaryImageAspectRatio,SortName,Path,ChildCount&ImageTypeLimit=1&ParentId=${playlistsLibrary.Id}&SortBy=IsFolder,SortName&SortOrder=Ascending`)
          .then((playlists) => {
            setPlaylists(playlists);
            setLoading(false);
          })
          .catch(handleError);
      })
      .catch(handleError);
  }, []);

  return (
    <>
      {playlists ? (
        <>
          <Heading level={3}>Playlists</Heading>
          <Grid fluid>
            <Row gutter={16}>
              {playlists.Items.map((item, index) => (
                <ItemTile item={item} key={item.Id} tileProps={{ onClick: () => (window.location.hash = `#playlists/${item.Id}`), className: "pointer" }} />
              ))}
            </Row>
          </Grid>
        </>
      ) : (
        error && <Fallback icon={errorIcon} text={error} />
      )}
    </>
  );
}
