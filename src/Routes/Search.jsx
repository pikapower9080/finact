import { Heading, Input, InputGroup, Text, Form, Grid, Row } from "rsuite";
import Icon from "../Components/Icon";
import { useState, useEffect, Fragment, useContext } from "react";
import { getStorage } from "../storage";
import { jellyfinRequest } from "../Util/Network";
import ItemTile from "../Components/ItemTile";
import { GlobalState } from "../App";

const storage = getStorage();

const searchedItemTypes = ["MusicAlbum", "Audio"];
const itemTypeDisplayNames = { MusicAlbum: "Albums", Audio: "Tracks" };

async function searchInstance(searchQuery) {
  const requests = [];

  for (let searchedItemType in searchedItemTypes) {
    const query = {
      userId: storage.get("User").Id,
      limit: 100,
      recursive: true,
      searchTerm: searchQuery ?? "",
      includeItemTypes: searchedItemType
    };

    const params = new URLSearchParams();
    for (const key in query) params.set(key, query[key]);

    const request = jellyfinRequest(`/Items?${params.toString()}`);

    requests.push(request);
  }

  const searchResults = await Promise.all(requests);
  console.log(searchResults);
  return searchResults;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const { setPlaybackState } = useContext(GlobalState);

  return (
    <>
      <Heading level={3}>Search</Heading>
      <Form
        onSubmit={async () => {
          if (searching) return;
          setSearching(true);
          setSearchResults(await searchInstance(searchQuery));
          setSearched(true);
          setSearching(false);
        }}
      >
        <InputGroup>
          <Input value={searchQuery} onChange={setSearchQuery} />
          <InputGroup.Button type="submit" loading={searching} disabled={searching}>
            <Icon icon="search" noSpace />
          </InputGroup.Button>
        </InputGroup>
      </Form>
      {searchResults.length > 0 ? (
        <>
          {searchResults.map((category, index) => {
            if (!("Items" in category) || category.Items.length == 0) {
              return null;
            }
            return (
              <Fragment key={index}>
                <Heading level={3}>{itemTypeDisplayNames[category.Items[0].Type] || "Unknown"}</Heading>
                <Grid fluid>
                  <Row gutter={16}>
                    {category.Items.map((item) => {
                      if (!item || item.Id == null) return;
                      return (
                        <ItemTile
                          item={item}
                          key={item.Id}
                          tileProps={{
                            className: "pointer",
                            onClick: (e) => {
                              if (item.Type && item.Type == "Audio") {
                                setPlaybackState({
                                  item,
                                  playing: true,
                                  position: 0,
                                  queue: {
                                    items: category.Items,
                                    index: category.Items.findIndex((x) => x.Id == item.Id)
                                  }
                                });
                              }
                            }
                          }}
                        />
                      );
                    })}
                  </Row>
                </Grid>
              </Fragment>
            );
          })}
        </>
      ) : (
        searched && "No results found"
      )}
    </>
  );
}
