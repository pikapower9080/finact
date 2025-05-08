import { Avatar, HStack, List, Modal, Placeholder, Text, VStack } from "rsuite";
import { getUser, GlobalState } from "../App";
import { useContext, useEffect, useState } from "react";
import { getLibrary, jellyfinRequest } from "../Util/Network";
import { getStorage } from "../storage";
import { errorNotification, successNotification } from "../Util/Toaster";

const storage = getStorage();

export default function AddToPlaylist({ item }) {
  const { setAddToPlaylistItem, toaster } = useContext(GlobalState);
  const [playlists, setPlaylists] = useState([]);

  async function fetchPlaylists() {
    if (!item) return;
    const playlistsLibrary = await getLibrary("playlists");
    const response = await jellyfinRequest(`/Users/${getUser().Id}/Items?StartIndex=0&Limit=100&Fields=PrimaryImageAspectRatio,SortName,Path,ChildCount&ImageTypeLimit=1&ParentId=${playlistsLibrary.Id}&SortBy=IsFolder,SortName&SortOrder=Ascending`);
    setPlaylists(response.Items);
  }

  useEffect(() => {
    fetchPlaylists();
  }, [item]);

  return (
    <Modal
      open={!!item}
      onClose={() => {
        setAddToPlaylistItem(null);
      }}
    >
      <Modal.Header>
        <Modal.Title>Add to Playlist</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {playlists.length > 0 ? (
          <>
            <List bordered hover className="pointer">
              {playlists.map((playlist) => {
                return (
                  <List.Item
                    key={playlist.Id}
                    onClick={async () => {
                      setAddToPlaylistItem(null);
                      try {
                        await jellyfinRequest(`/Playlists/${playlist.Id}/Items?ids=${item.Id}&userId=${getUser().Id}`, { method: "POST" }, "text");
                      } catch (e) {
                        toaster.push(errorNotification("Failed to add to playlist", e.toString().includes("Forbidden") ? "You do not have permission to add items to this playlist" : e.toString()));
                        return;
                      }
                      toaster.push(successNotification("Added to playlist", `${item.Name} has been added to ${playlist.Name}.`, { onClick: () => (window.location.href = `/#playlists/${playlist.Id}`), className: "pointer" }));
                    }}
                  >
                    <HStack spacing={10}>
                      <Avatar src={`${storage.get("serverURL")}/Items/${playlist.Id}/Images/Primary`} />
                      <VStack spacing={0}>
                        <Text>{playlist.Name}</Text>
                        <Text muted>{playlist.ChildCount} items</Text>
                      </VStack>
                    </HStack>
                  </List.Item>
                );
              })}
            </List>
          </>
        ) : (
          <Placeholder.Paragraph graph="square" active />
        )}
      </Modal.Body>
    </Modal>
  );
}
