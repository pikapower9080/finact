import { useEffect, useState } from "react";
import { Col, Grid, Heading, Image, Placeholder, Row } from "rsuite";
import { getLibrary, jellyfinRequest } from "../Util/Network";
import { getUser } from "../App";
import { getStorage } from "../storage";

const storage = getStorage();

const getColSize = () => {
  return {
    xs: 12,
    sm: 8,
    md: 6,
    lg: 4,
    xl: 3
  };
};

const squareStyle = {
  position: "relative",
  width: "100%",
  paddingTop: "100%", // 1:1 aspect ratio
  marginBottom: "16px",
  borderRadius: "8px",
  overflow: "hidden"
};

const contentStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold"
};

function Playlist(props) {
  return (
    <Col key={props.playlist.Id} {...getColSize()}>
      <div style={squareStyle}>
        <div style={contentStyle}>
          <Image draggable={false} src={`${storage.get("serverURL")}/Items/${props.playlist.Id}/Images/Primary`}></Image>
        </div>
      </div>
      <p>{props.playlist.Name}</p>
    </Col>
  );
}

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
                <Playlist playlist={item} />
              ))}
            </Row>
          </Grid>
        </>
      )}
    </>
  );
}
