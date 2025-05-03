import { Avatar, Button, ButtonGroup, FlexboxGrid, HStack, VStack, Navbar, Slider, Text } from "rsuite";
import { getStorage } from "../storage";
import { useContext, useEffect, useRef, useState } from "react";
import { PlaybackContext } from "../App";
import { getAlbumArt } from "../Util/Formatting";
import Icon from "../Components/Icon";
import { jellyfinRequest } from "../Util/Network";
import ItemContextMenu from "./ItemContextMenu";
import Spacer from "./Spacer";
import Visualizer from "./Visualizer";
const storage = getStorage();

export default function NowPlaying(props) {
  const audioRef = useRef(null);
  const { playbackState, setPlaybackState } = useContext(PlaybackContext);
  const [visualizerOpen, setVisualizerOpen] = useState(false);

  function getArtistDisplay(artists) {
    const artistNames = artists.join(" / ");
    return artistNames.length > 29 ? `${artistNames.slice(0, 29)}...` : artistNames;
  }

  useEffect(() => {
    if (audioRef.current) {
      if (props.state.playing) {
        audioRef.current.play();
        if (props.state.position == 0) {
          jellyfinRequest(`/Sessions/Playing`, {
            method: "POST",
            body: JSON.stringify({
              CanSeek: false,
              Item: props.state.item,
              ItemId: props.state.item.Id,
              IsPaused: false,
              IsMuted: false,
              PositionTicks: 0,
              VolumeLevel: 100
            }),
            headers: {
              "Content-Type": "application/json"
            }
          }).catch(() => {});
        }
      } else {
        audioRef.current.pause();
      }
      console.log("Current time:", props.state.position);
      audioRef.current.currentTime = props.state.position;
    }

    if ("mediaSession" in navigator) {
      const mediaSession = navigator.mediaSession;
      mediaSession.metadata = new MediaMetadata({
        title: props.state.item.Name,
        artist: props.state.item.Artists.join(" / "),
        album: props.state.item.Album,
        artwork: [
          {
            src: getAlbumArt(props.state.item),
            sizes: "512x512",
            type: "image/jpeg"
          }
        ]
      });

      mediaSession.setActionHandler("play", () => {
        setPlaybackState((prevState) => ({
          ...prevState,
          playing: true
        }));
      });

      mediaSession.setActionHandler("pause", () => {
        setPlaybackState((prevState) => ({
          ...prevState,
          playing: false
        }));
      });
    }
  }, [props.state]);

  return (
    <Navbar className="now-playing" style={{ flexBasis: 0 }}>
      <audio ref={audioRef} crossorigin="anonymous" src={`${storage.get("serverURL")}/Items/${props.state.item.Id}/Download?api_key=${storage.get("AccessToken")}`} playsInline={true} />
      <Slider
        className="now-playing-slider"
        progress
        max={props.state.item.RunTimeTicks / 10000}
        defaultValue={0}
        step={1000}
        renderTooltip={(e) => {
          const minutes = Math.floor(e / 1000 / 60);
          const seconds = Math.floor((e / 1000) % 60);
          const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
          const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
          return `${formattedMinutes}:${formattedSeconds}`;
        }}
        onChangeCommitted={(e) => {
          const newTime = e / 1000;
          setPlaybackState((prevState) => ({
            ...prevState,
            position: newTime
          }));
        }}
      />
      <FlexboxGrid justify="space-around" align="middle">
        <FlexboxGrid.Item style={{ flex: 1 }}>
          <HStack spacing={10}>
            <Avatar size="sm" src={getAlbumArt(props.state.item)} />
            <div>
              <VStack spacing={0}>
                <Text weight="bold" className="no-select">
                  {props.state.item.Name}
                </Text>
                <Text muted className="no-select">
                  {getArtistDisplay(props.state.item.Artists)}
                </Text>
              </VStack>
            </div>
          </HStack>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <ButtonGroup>
            <Button appearance="subtle">
              <Icon icon={"skip_previous"} noSpace />
            </Button>
            <Button
              appearance="subtle"
              onClick={() => {
                setPlaybackState((prevState) => ({
                  ...prevState,
                  playing: !prevState.playing
                }));
              }}
            >
              <Icon icon={props.state.playing ? "pause" : "play_arrow"} noSpace />
            </Button>
            <Button appearance="subtle">
              <Icon icon={"skip_next"} noSpace />
            </Button>
          </ButtonGroup>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button className="square" appearance="subtle" title="Open Visualizer" onClick={() => setVisualizerOpen(!visualizerOpen)}>
            <Icon icon={"music_video"} noSpace />
          </Button>
          <Spacer width={9} />
          <Button
            className="square"
            appearance="subtle"
            title={`${props.state.item.UserData.IsFavorite ? "Remove from" : "Add to"} favorites`}
            onClick={() => {
              setPlaybackState((prevState) => ({
                ...prevState,
                item: {
                  ...prevState.item,
                  UserData: {
                    ...prevState.item.UserData,
                    IsFavorite: !prevState.item.UserData.IsFavorite
                  }
                }
              }));
            }}
          >
            <Icon icon={"favorite"} noSpace className={props.state.item.UserData.IsFavorite && "red-400"} />
          </Button>
          <Spacer width={9} />
          <ItemContextMenu
            item={props.state.item}
            menuButton={
              <Button appearance="subtle" className="square">
                <Icon icon="more_vert" noSpace />
              </Button>
            }
          />
        </FlexboxGrid.Item>
      </FlexboxGrid>
      {visualizerOpen ? <Visualizer audioRef={audioRef} /> : <></>}
    </Navbar>
  );
}
