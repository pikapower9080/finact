import { Avatar, HStack, List, Modal, Placeholder, Text, VStack } from "rsuite";
import { getUser, GlobalState } from "../App";
import { useContext, useEffect, useState } from "react";
import { getLibrary, jellyfinRequest } from "../Util/Network";
import { getStorage } from "../storage";
import { errorNotification, successNotification } from "../Util/Toaster";
import { pluralize } from "../Util/Formatting";

const storage = getStorage();

export default function AddItem({ item, type }) {
  const { setAddItem, toaster } = useContext(GlobalState);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);

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
    >
      <Modal.Header>
        <Modal.Title>Add to {type == "playlist" ? "Playlist" : "Collection"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {items ? (
          <>
            <List bordered hover className="pointer">
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
    </Modal>
  );
}
