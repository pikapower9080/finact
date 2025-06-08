import { Avatar, Button, Checkbox, CheckboxGroup, FlexboxGrid, Form, HStack, List, Modal, Placeholder, Text, VStack } from "rsuite";
import { getUser, GlobalState } from "../App";
import { useContext, useEffect, useState } from "react";
import { getLibrary, jellyfinRequest } from "../Util/Network";
import { getStorage } from "../storage";
import { errorNotification, successNotification } from "../Util/Toaster";
import { pluralize } from "../Util/Formatting";
import Icon from "./Icon";

const storage = getStorage();

export default function AddItem({ item, type }) {
  const { setAddItem, toaster } = useContext(GlobalState);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  async function fetchItems() {
    if (!item) return;
    try {
      const library = await getLibrary(type == "playlist" ? "playlists" : "boxsets");
      const response = await jellyfinRequest(`/Users/${getUser().Id}/Items?StartIndex=0&Limit=100&Fields=PrimaryImageAspectRatio,SortName,Path,ChildCount&ImageTypeLimit=1&ParentId=${library.Id}&SortBy=IsFolder,SortName&SortOrder=Ascending`);
      setItems(response.Items);
    } catch (err) {
      console.error(err);
      setError(true);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [item]);

  return (
    <Modal
      open={!!item}
      onClose={() => {
        setAddItem(null);
      }}
      onExited={() => {
        setCurrentPage(0);
        setItems(null);
        setError(false);
      }}
    >
      {currentPage == 0 ? (
        <>
          <Modal.Header>
            <Modal.Title>Add to {type == "playlist" ? "Playlist" : "Collection"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {items ? (
              <>
                <List bordered hover className="pointer">
                  <List.Item
                    key="create"
                    onClick={() => {
                      setCurrentPage(1);
                    }}
                  >
                    <HStack spacing={10}>
                      <Avatar>
                        <Icon icon={"playlist_add"} noSpace />
                      </Avatar>
                      <Text>New {type}</Text>
                    </HStack>
                  </List.Item>
                  {items.map((parentItem) => {
                    return (
                      <List.Item
                        key={parentItem.Id}
                        onClick={async () => {
                          setAddItem(null);
                          try {
                            await jellyfinRequest(`/${type == "playlist" ? "Playlists" : "Collections"}/${parentItem.Id}/Items?ids=${item.Id}&userId=${getUser().Id}`, { method: "POST" }, "text");
                          } catch (e) {
                            toaster.push(errorNotification("Failed to add to " + type, e.toString().includes("Forbidden") ? "You do not have permission to add items to this " + type + "." : e.toString()));
                            return;
                          }
                          toaster.push(successNotification("Added to " + type, `${item.Name} has been added to ${parentItem.Name}.`, { onClick: () => (window.location.hash = `#${type}s/${parentItem.Id}`), className: "pointer" }));
                        }}
                      >
                        <HStack spacing={10}>
                          <Avatar src={`${storage.get("serverURL")}/Items/${parentItem.Id}/Images/Primary`} />
                          <VStack spacing={0}>
                            <Text>{parentItem.Name}</Text>
                            <Text muted>
                              {parentItem.ChildCount} {pluralize(parentItem.ChildCount, "item")}
                            </Text>
                          </VStack>
                        </HStack>
                      </List.Item>
                    );
                  })}
                </List>
              </>
            ) : !error ? (
              <Placeholder.Paragraph graph="square" active />
            ) : (
              <Text>No {type}s yet</Text>
            )}
          </Modal.Body>
        </>
      ) : (
        <>
          <Modal.Header>
            <Modal.Title>Create New {type == "playlist" ? "Playlist" : "Collection"}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={console.log} fluid>
            <Modal.Body>
              <Form.ControlLabel>Name</Form.ControlLabel>
              <Form.Control defaultValue={""} name="name"></Form.Control>
              {type == "playlist" && (
                <>
                  <Form.Control accepter={CheckboxGroup} name="public">
                    <Checkbox value={1}>Allow Public Access</Checkbox>
                  </Form.Control>
                  <Form.HelpText>Make this playlist visible to all logged in users</Form.HelpText>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <FlexboxGrid>
                <FlexboxGrid.Item
                  onClick={() => {
                    setCurrentPage(0);
                  }}
                >
                  <Button type="reset">Back</Button>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item style={{ flexGrow: 1, justifySelf: "flex-end" }}>
                  <Button appearance="primary" type="submit">
                    Create
                  </Button>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </Modal.Footer>
          </Form>
        </>
      )}
    </Modal>
  );
}
