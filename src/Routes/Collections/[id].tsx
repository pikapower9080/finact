import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Heading, Grid, Row } from "rsuite";
import { getUser, GlobalState } from "../../App";
import ItemTile from "../../Components/ItemTile";
import { getItems } from "../../Client";
import type { BaseItemDtoQueryResult } from "../../Client/index";

export default function Collection() {
  const { id } = useParams();

  const [items, setItems] = useState<BaseItemDtoQueryResult | null>(null);
  const { loading, setLoading } = useContext(GlobalState);

  useEffect(() => {
    setLoading(true);
    const fetchCollectionItems = async () => {
      const itemsResponse = await getItems({
        query: {
          parentId: id,
          fields: ["ItemCounts", "PrimaryImageAspectRatio", "CanDelete"]
        }
      });

      setItems(itemsResponse.data!);

      setLoading(false);
    };

    fetchCollectionItems();
  }, [id]);

  return (
    <>
      {items && items.Items ? (
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
