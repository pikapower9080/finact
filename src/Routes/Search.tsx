import { Heading, Input, InputGroup, Text, Form, Grid, Row, FlexboxGrid } from "rsuite";
import Icon from "../Components/Icon";
import { useState, Fragment, useContext } from "react";
import { getStorage } from "../storage";
import ItemTile from "../Components/ItemTile";
import { GlobalState } from "../App";
import { playItem } from "../Util/Helpers";
import Fallback from "../Components/Fallback";
import { getItems } from "../Client";
import type { BaseItemDto, BaseItemKind } from "../Client/index";

const storage = getStorage();

const searchedItemTypes: BaseItemKind[] = ["MusicAlbum", "Playlist", "Audio"];
const itemTypeDisplayNames = { MusicAlbum: "Albums", Audio: "Tracks", Playlist: "Playlists" };

interface Categories {
  Type: BaseItemKind;
  Items: BaseItemDto[];
}

async function searchInstance(searchQuery: string = "") {
  const searchResults = await getItems({
    query: {
      userId: storage.get("User").Id,
      limit: 100,
      recursive: true,
      searchTerm: searchQuery,
      includeItemTypes: searchedItemTypes
    }
  });

  const categories: Categories[] = [];

  searchResults.data!.Items!.forEach((item) => {
    const type = item.Type!;

    if (!categories.some((category) => category.Type === type)) {
      categories.push({ Type: type, Items: [] });
    }

    const category = categories.find((category) => category.Type === type);

    if (category) {
      category.Items.push(item);
    }
  });

  categories.sort((a, b) => {
    const indexA = searchedItemTypes.indexOf(a.Type);
    const indexB = searchedItemTypes.indexOf(b.Type);
    return indexA - indexB;
  });

  return categories;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Categories[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const { setPlaybackState, setQueue } = useContext(GlobalState);

  return (
    <>
      <FlexboxGrid style={{ flexDirection: "column", minHeight: "100%" }}>
        <FlexboxGrid.Item>
          <Heading level={3}>Search</Heading>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item style={{ width: "100%" }}>
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
              <Input autoFocus value={searchQuery} onChange={setSearchQuery} />
              <InputGroup.Button type="submit" loading={searching} disabled={searching}>
                <Icon icon="search" noSpace />
              </InputGroup.Button>
            </InputGroup>
          </Form>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item
          style={{ width: "100%", flexGrow: 1, display: searched && searchResults.length == 0 ? "flex" : "unset", alignItems: "center" }}
        >
          {searchResults.length > 0 ? (
            <>
              {searchResults.map((category, index) => {
                if (!("Items" in category) || category.Items.length == 0) {
                  return null;
                }
                return (
                  <Fragment key={index}>
                    <Heading level={4} style={{ marginBlock: 10 }}>
                      {itemTypeDisplayNames[category.Type] || "Unknown"}
                    </Heading>
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
                                    playItem(setPlaybackState, setQueue, item, category.Items);
                                  } else if (item.Type == "MusicAlbum") {
                                    window.location.hash = `#albums/${item.Id}`;
                                  } else if (item.Type == "Playlist") {
                                    window.location.hash = `#playlists/${item.Id}`;
                                  } else {
                                    console.warn("Unknown item type", item);
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
            searched && <Fallback icon="search_off" text="No results found" />
          )}
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </>
  );
}
