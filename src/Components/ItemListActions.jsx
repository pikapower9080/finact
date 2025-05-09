import { Button, ButtonGroup } from "rsuite";
import Icon from "./Icon";
import { useContext, useState } from "react";
import { getUser, GlobalState } from "../App";
import { jellyfinRequest } from "../Util/Network";
import ItemContextMenu from "./ItemContextMenu";

export default function ItemListActions({ parent, items, type }) {
  const { setPlaybackState } = useContext(GlobalState);
  const [isFavorite, setIsFavorite] = useState(parent.UserData.IsFavorite);
  const [loadingIsFavorite, setLoadingIsFavorite] = useState(false);

  return (
    <ButtonGroup>
      <Button
        className="square subtle-bordered"
        appearance="subtle"
        onClick={() => {
          setPlaybackState({
            item: items[0],
            playing: true,
            position: 0,
            queue: {
              items,
              index: 0
            }
          });
        }}
      >
        <Icon icon="play_arrow" noSpace />
      </Button>
      <Button
        className="square subtle-bordered"
        appearance="subtle"
        onClick={() => {
          const shuffledItems = [...items].sort(() => Math.random() - 0.5);
          setPlaybackState({
            item: shuffledItems[0],
            playing: true,
            position: 0,
            queue: {
              items: shuffledItems,
              index: 0
            }
          });
        }}
      >
        <Icon icon="shuffle" noSpace />
      </Button>
      <Button
        className="square subtle-bordered"
        appearance="subtle"
        loading={loadingIsFavorite}
        onClick={() => {
          if (loadingIsFavorite) return;
          setLoadingIsFavorite(true);
          jellyfinRequest(`/Users/${getUser().Id}/FavoriteItems/${parent.Id}`, {
            method: isFavorite ? "DELETE" : "POST"
          }).then((response) => {
            setIsFavorite(response.IsFavorite);
            setLoadingIsFavorite(false);
          });
        }}
      >
        <Icon icon="favorite" noSpace className={isFavorite && "red-400"} />
      </Button>
      <ItemContextMenu
        menuButton={
          <Button className="square subtle-bordered force-last" appearance="subtle">
            <Icon icon="more_vert" noSpace />
          </Button>
        }
        item={parent}
      />
    </ButtonGroup>
  );
}
