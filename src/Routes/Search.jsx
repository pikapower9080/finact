import { Heading, Input, InputGroup, Text, Form } from "rsuite";
import Icon from "../Components/Icon";
import { useState, useEffect } from "react";
import { getStorage } from "../storage";

const storage = getStorage();

const searchedItemTypes = ["MusicAlbum", "Audio"];

async function searchInstance(searchQuery) {
  const requests = [];

  for (searchedItemType in searchedItemTypes) {
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
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Heading level={3}>Search</Heading>
      <Form onSubmit={() => searchInstance(searchQuery)}>
        <InputGroup>
          <Input value={searchQuery} onChange={setSearchQuery} />
          <InputGroup.Addon>
            <Icon icon="search" />
          </InputGroup.Addon>
        </InputGroup>
      </Form>
    </>
  );
}
