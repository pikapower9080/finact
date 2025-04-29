import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Heading, Button, Placeholder, Grid, Row } from "rsuite";
import { jellyfinRequest } from "../../Util/Network";
import { getUser } from "../../App";
import ItemTile from "../../Components/ItemTile";

export default function Collection() {
  const { id } = useParams();

  const [items, setItems] = useState(null);

  useEffect(() => {
    const fetchCollectionItems = async () => {
      const data = await jellyfinRequest(`/Users/${getUser().Id}/Items?ParentId=${id}&Fields=ItemCounts,PrimaryImageAspectRatio,CanDelete`);
      setItems(data);
    };

    fetchCollectionItems();
  }, []);

  return (
    <>
      <Heading level={3}>Albums</Heading>
      {items ? (
        <>
          <Grid fluid>
            <Row gutter={16}>
              {items.Items.map((item, index) => (
                <ItemTile item={item} />
              ))}
            </Row>
          </Grid>
        </>
      ) : (
        "Loading..."
      )}
    </>
  );
}
