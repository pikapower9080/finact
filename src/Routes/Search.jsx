import { Heading, Input, InputGroup, Text } from "rsuite";
import { useQueryState } from "../Util/UseQueryState";
import Icon from "../Components/Icon";

export default function Search() {
  const [searchQuery, setSearchQuery] = useQueryState("q");
  return (
    <>
      <Heading level={3}>Search</Heading>
      <InputGroup>
        <Input value={searchQuery} onChange={setSearchQuery} />
        <InputGroup.Addon>
          <Icon icon="search" />
        </InputGroup.Addon>
      </InputGroup>
    </>
  );
}
