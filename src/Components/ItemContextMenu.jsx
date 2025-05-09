import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import Icon from "./Icon";
import { getStorage } from "../storage";
import { getUser, GlobalState } from "../App";
import { jellyfinRequest } from "../Util/Network";
import { useContext } from "react";
import copy from "copy-to-clipboard";

const storage = getStorage();

export default function ItemContextMenu({ item, menuButton }) {
  const { loading, setLoading, setAddToPlaylistItem } = useContext(GlobalState);
  const user = getUser();

  const menuCategories = [];

  if (item.Type === "Audio") {
    const generalCategory = [];
    if (!window.location.hash.includes("albums")) {
      generalCategory.push({
        icon: "album",
        label: "Go to Album",
        action: () => {
          window.location.href = "/#albums/" + item.AlbumId;
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
