import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Heading, Grid, Row } from "rsuite";
import { jellyfinRequest } from "../../Util/Network";
import { getUser, GlobalState } from "../../App";
import ItemTile from "../../Components/ItemTile";

export default function Collection() {
  const { id } = useParams();

  const [items, setItems] = useState(null);
  const { loading, setLoading } = useContext(GlobalState);

  useEffect(() => {
    setLoading(true);
    const fetchCollectionItems = async () => {
      const data = await jellyfinRequest(`/Users/${getUser().Id}/Items?ParentId=${id}&Fields=ItemCounts,PrimaryImageAspectRatio,CanDelete`);
      setItems(data);
      setLoading(false);
    };

    fetchCollectionItems();
  }, [id]);

  return (
    <>
      {items ? (
        <>
          <Heading level={3}>Albums</Heading>
          <Grid fluid>
            <Row gutter={16}>
              {items.Items.map((item, index) => (
                <ItemTile
                  item={item}
                  tileProps={{
                    onClick: () => {
                      location.hash = "#albums/" + item.Id;
                    },
                    className: "pointer"
                  }}
                />
              ))}
            </Row>
          </Grid>
        </>
      ) : (
        ""
      )}
    </>
  );
}
