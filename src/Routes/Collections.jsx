import { useEffect, useState } from "react";
import { Col, Grid, Heading, Image, Placeholder, Row } from "rsuite";
import { getLibrary, jellyfinRequest } from "../Util/Network";
import { getUser } from "../App";
import { getStorage } from "../storage";
import ItemTile from "../Components/ItemTile";

const storage = getStorage();

export default function Collections() {
  const [collections, setCollections] = useState(null);

  useEffect(() => {
    getLibrary("boxsets").then((collectionsLibrary) => {
      const query = {
        StartIndex: 0,
        Limit: 100,
        Fields: ["PrimaryImageAspectRatio", "SortName", "Path", "ChildCount"],
        ImageTypeLimit: 1,
        ParentId: collectionsLibrary.Id,
        SortBy: ["IsFolder", "SortName"],
        SortOrder: "Ascending"
      };

      const params = new URLSearchParams();
      for (const key in query) params.set(key, query[key]);

      jellyfinRequest(`/Users/${getUser().Id}/Items?${params.toString()}`).then((collections) => {
        setCollections(collections);
      });
    });
  }, []);

  return (
    <>
      {!collections ? (
        <Placeholder.Graph active width={100} height={100} />
      ) : (
        <>
          <Heading level={3}>Collections</Heading>
          <Grid fluid>
            <Row gutter={16}>
              {collections.Items.map((item, index) => (
                <ItemTile item={item} tileProps={{ onClick: () => (window.location.href = `/#collections/${item.Id}`), className: "pointer" }} key={item.Id} />
              ))}
            </Row>
          </Grid>
        </>
      )}
    </>
  );
}
