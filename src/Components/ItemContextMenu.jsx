import { Menu, MenuItem } from "@szhsin/react-menu";
import Icon from "./Icon";
import { getStorage } from "../storage";
import { getUser, LoadingContext } from "../App";
import { jellyfinRequest } from "../Util/Network";
import { useContext } from "react";

const storage = getStorage();

export default function ItemContextMenu({ item, menuButton }) {
  const { loading, setLoading } = useContext(LoadingContext);

  return (
    <Menu menuButton={menuButton} align="end" transition theming="dark" onClick={(e) => e.stopPropagation()}>
      <MenuItem
        disabled={getUser().Policy.EnableContentDownloading === false}
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
    </Menu>
  );
}
