import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import Icon from "./Icon";
import { getStorage } from "../storage";
import { getUser, LoadingContext } from "../App";
import { jellyfinRequest } from "../Util/Network";
import { useContext } from "react";

const storage = getStorage();

export default function ItemContextMenu({ item, menuButton }) {
  const { loading, setLoading } = useContext(LoadingContext);
  const user = getUser();

  return (
    <Menu menuButton={menuButton} align="end" transition theming="dark" onClick={(e) => e.stopPropagation()}>
      <MenuItem href={"/#albums/" + item.AlbumId}>
        <Icon icon="album" />
        Go to Album
      </MenuItem>
      <MenuDivider />
      <MenuItem
        disabled={user.Policy.EnableContentDownloading === false}
        onClick={async () => {
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
        }}
      >
        <Icon icon="download" />
        Download
      </MenuItem>
      <MenuItem
        disabled={user.Policy.EnableContentDownloading === false}
        onClick={() => {
          navigator.clipboard.writeText(`${storage.get("serverURL")}/Items/${item.Id}/Download?api_key=${storage.get("AccessToken")}`);
        }}
      >
        <Icon icon="link" />
        Copy Stream URL
      </MenuItem>
      <MenuItem onClick={() => navigator.clipboard.writeText(item.Id)}>
        <Icon icon="content_copy" />
        Copy Item ID
      </MenuItem>
    </Menu>
  );
}
