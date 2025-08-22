import { useContext, useEffect, useState } from "react";
import { Grid, Heading, Row } from "rsuite";
import { getLibrary } from "../Util/Network";
import { getUser, GlobalState } from "../App";
import { getStorage } from "../storage";
import ItemTile from "../Components/ItemTile";
import Fallback from "../Components/Fallback";
import { getItems } from "../Client";
import type { BaseItemDtoQueryResult } from "../Client/index";

const storage = getStorage();

export default function Collections() {
  const [collections, setCollections] = useState<BaseItemDtoQueryResult | null>(null);
  const { loading, setLoading } = useContext(GlobalState);
  const [error, setError] = useState("");
  const [errorIcon, setErrorIcon] = useState("apps_outage");

  useEffect(() => {
    setLoading(true);

    getLibrary("boxsets")
      .then((collectionsLibrary) => {
        getItems({
          query: {
            startIndex: 0,
            limit: 100,
            imageTypeLimit: 1,
            parentId: collectionsLibrary.Id,
            fields: ["PrimaryImageAspectRatio", "SortName", "Path", "ChildCount"],
            sortBy: ["IsFolder", "SortName"],
            sortOrder: ["Ascending"]
          }
        }).then((collectionsResponse) => {
          setCollections(collectionsResponse.data!);
          setLoading(false);
        });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        if (err.toString().includes("not found")) {
          setError("No collections yet");
          setErrorIcon("search_off");
        } else if (err.toString().includes("NetworkError")) {
          setError("Network error");
          setErrorIcon("wifi_off");
        } else {
          setError("Failed to load collections");
        }
      });
  }, []);

  return (
    <>
      {collections && collections.Items ? (
        <>
          <Heading level={3}>Collections</Heading>
          <Grid fluid>
            <Row gutter={16}>
              {collections.Items.map((item, index) => (
                <ItemTile
                  item={item}
                  tileProps={{ onClick: () => (window.location.hash = `#collections/${item.Id}`), className: "pointer" }}
                  key={item.Id}
                />
              ))}
            </Row>
          </Grid>
        </>
      ) : (
        error && <Fallback text={error} icon={errorIcon} />
      )}
    </>
  );
}
