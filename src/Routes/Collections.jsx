import { useContext, useEffect, useState } from "react";
import { Grid, Heading, Row } from "rsuite";
import { getLibrary, jellyfinRequest } from "../Util/Network";
import { getUser, LoadingContext } from "../App";
import { getStorage } from "../storage";
import ItemTile from "../Components/ItemTile";

const storage = getStorage();

export default function Collections() {
  const [collections, setCollections] = useState(null);
  const { loading, setLoading } = useContext(LoadingContext);

  useEffect(() => {
    setLoading(true);
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
        setLoading(false);
      });
    });
  }, []);

  return (
    <>
      {collections && (
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
