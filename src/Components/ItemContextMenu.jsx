import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import Icon from "./Icon";
import { getStorage } from "../storage";
import { getUser, GlobalState } from "../App";
import { jellyfinRequest } from "../Util/Network";
import { useContext, useState } from "react";
import copy from "copy-to-clipboard";
import { playItem } from "../Util/Helpers";
import { errorNotification, infoNotification } from "../Util/Toaster";

const storage = getStorage();

export default function ItemContextMenu({ item, menuButton, type }) {
  const { setLoading, setAddToPlaylistItem, setPlaybackState, queue, setQueue, toaster } = useContext(GlobalState);
  const user = getUser();

  const [isFavorite, setIsFavorite] = useState(item.UserData?.IsFavorite || false);

  const menuCategories = [];
  let playbackCategory = [];

  if (type !== "queue" && type !== "now-playing") {
    if (item.Type === "Audio") {
      playbackCategory.push({
        icon: "play_arrow",
        label: "Play",
        action: () => {
          playItem(setPlaybackState, setQueue, item);
        }
      });
      playbackCategory.push({
        icon: "playlist_add",
        label: "Add to queue",
        action: () => {
          if (queue && queue.items) {
            // Check if the item is already in the queue
            const isInQueue = queue.items.some((queueItem) => queueItem.Id === item.Id);
            if (isInQueue) {
              toaster.push(infoNotification("Error", "Item is already in the queue"));
              return;
            }
          }
          setQueue((prevQueue) => {
            const newQueue = prevQueue ? { ...prevQueue, items: [...prevQueue.items, item] } : { items: [item], index: 0 };
            return newQueue;
          });
        }
      });
      playbackCategory.push({
        icon: "playlist_add",
        label: "Play next",
        action: () => {
          if (queue && queue.items) {
            // Check if the item is already in the queue
            const isInQueue = queue.items.some((queueItem) => queueItem.Id === item.Id);
            if (isInQueue) {
              toaster.push(infoNotification("Error", "Item is already in the queue"));
              return;
            }
          }
          setQueue((prevQueue) => {
            // Insert the item at the next position in the queue
            const newQueue = prevQueue ? { ...prevQueue, items: [...prevQueue.items] } : { items: [], index: 0 };
            newQueue.items.splice(newQueue.index + 1, 0, item);
            return newQueue;
          });
        }
      });
      menuCategories.push(playbackCategory);
    }
  }

  if (item.Type === "Audio") {
    const generalCategory = [];
    if (!window.location.hash.includes("albums")) {
      generalCategory.push({
        icon: "album",
        label: "Go to Album",
        action: () => {
          window.location.hash = "#albums/" + item.AlbumId;
        }
      });
    }
    generalCategory.push({
      icon: "playlist_add",
      label: "Add to Playlist",
      action: () => {
        setAddToPlaylistItem(item);
      }
    });
    if (item.UserData && "IsFavorite" in item.UserData) {
      generalCategory.push({
        icon: isFavorite ? "favorite_border" : "favorite",
        label: isFavorite ? "Unfavorite" : "Favorite",
        action: async () => {
          try {
            await jellyfinRequest(`/Users/${getUser().Id}/FavoriteItems/${item.Id}`, {
              method: isFavorite ? "DELETE" : "POST"
            });
            setIsFavorite(!isFavorite);
          } catch (err) {
            console.error(err);
            toaster.push(errorNotification("Error", `Failed to ${isFavorite ? "add to" : "remove from"} favorites`));
          }
        }
      });
    }
    menuCategories.push(generalCategory);
    const advancedCategory = [];
    if (user.Policy.EnableContentDownloading) {
      advancedCategory.push({
        icon: "download",
        label: "Download",
        action: async () => {
          setLoading(true);
          try {
            const blob = await jellyfinRequest(`/Items/${item.Id}/Download?UserId=${getUser().Id}`, {}, "blob");
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = item.Name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          } finally {
            setLoading(false);
          }
        }
      });
      advancedCategory.push({
        icon: "link",
        label: "Copy Stream URL",
        action: () => {
          copy(`${storage.get("serverURL")}/Items/${item.Id}/Download?api_key=${storage.get("AccessToken")}`);
        }
      });
    }
    advancedCategory.push({
      icon: "content_copy",
      label: "Copy Item ID",
      action: () => {
        copy(item.Id);
      }
    });
    menuCategories.push(advancedCategory);
  }

  if (item.Type === "MusicAlbum" || item.Type === "Playlist") {
    menuCategories.push([
      {
        icon: "playlist_add",
        label: "Add to Playlist",
        action: () => {
          setAddToPlaylistItem(item);
        }
      }
    ]);
  }

  if (item.Type === "MusicAlbum") {
    menuCategories.push([{ icon: "content_copy", label: "Copy Album ID", action: () => copy(item.Id) }]);
  }
  if (item.Type === "Playlist") {
    menuCategories.push([{ icon: "content_copy", label: "Copy Playlist ID", action: () => copy(item.Id) }]);
  }

  return (
    <Menu menuButton={menuButton} align="end" transition theming="dark" onClick={(e) => e.stopPropagation()}>
      {menuCategories.map((category, index) => (
        <div key={index}>
          {index > 0 && <MenuDivider />}
          {category.map((item, itemIndex) => (
            <MenuItem
              key={itemIndex}
              onClick={(e) => {
                item.action();
              }}
            >
              <Icon icon={item.icon} />
              {item.label}
            </MenuItem>
          ))}
        </div>
      ))}
    </Menu>
  );
}
