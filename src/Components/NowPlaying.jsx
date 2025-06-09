import { Avatar, Button, ButtonGroup, FlexboxGrid, HStack, VStack, Navbar, Text, Footer, Whisper, Popover, Slider } from "rsuite";
import { getStorage } from "../storage";
import { useContext, useEffect, useRef, useState } from "react";
import { getUser, GlobalState } from "../App";
import { formatTimestamp, getAlbumArt, getPWADisplayMode } from "../Util/Formatting";
import Icon from "../Components/Icon";
import { jellyfinRequest } from "../Util/Network";
import ItemContextMenu from "./ItemContextMenu";
import Visualizer from "./Visualizer";
import { Scrubber } from "react-scrubber";
import "react-scrubber/lib/scrubber.css";
const storage = getStorage();
import isButterchurnSupported from "butterchurn/lib/isSupported.min";
import Lyrics from "./Lyrics";
import { isElectron, playItem } from "../Util/Helpers";
import localforage from "localforage";

export default function NowPlaying(props) {
  const audioRef = useRef(null);
  const { playbackState, setPlaybackState, queue, setQueue, lastCommand } = useContext(GlobalState);
  const [visualizerOpen, setVisualizerOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(100);
  const [repeat, setRepeat] = useState("none");
  const isScrubbing = useRef(false);
  const restoredVolume = useRef(false);

  let visualizerSupported = useRef(false);
  const fetchedLyrics = useRef(null);

  if (visualizerSupported.current == false && isButterchurnSupported()) {
    visualizerSupported.current = true;
  }

  function getArtistDisplay(artists) {
    const artistNames = artists.join(" / ");
    return artistNames.length > 29 ? `${artistNames.slice(0, 29)}...` : artistNames;
  }

  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    (async () => {
      const savedRepeat = await localforage.getItem("repeat");
      const savedVolume = await localforage.getItem("volume");

      if (savedRepeat && ["none", "all", "one"].includes(savedRepeat)) {
        setRepeat(savedRepeat);
      }
      console.log(savedVolume);
      if (savedVolume && typeof savedVolume === "number" && savedVolume >= 0 && savedVolume <= 100) {
        setVolume(savedVolume);
      }
      restoredVolume.current = true;
    })();

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audio = audioRef.current;
    if (audio && !audio.sourceNode) {
      const source = audioContextRef.current.createMediaElementSource(audio);
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 1;
      source.connect(gainNode);
      gainNodeRef.current = gainNode;
      gainNode.connect(audioContextRef.current.destination);
      source.connect(audioContextRef.current.destination);
      audio.sourceNode = source; // avoid multiple connections
    }
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (props.state.item && props.state.item.NormalizationGain && gainNodeRef.current) {
        gainNodeRef.current.gain.value = Math.pow(10, props.state.item.NormalizationGain / 20);
      } else {
        gainNodeRef.current.gain.value = 1;
      }
      if (props.state.playing) {
        audioRef.current.play();
        if (props.state.position == 0) {
          setPosition(props.state.position);
          jellyfinRequest(`/Sessions/Playing`, {
            method: "POST",
            body: JSON.stringify({
              CanSeek: false,
              ItemId: props.state.item.Id,
              IsPaused: false,
              IsMuted: false,
              PositionTicks: 0,
              VolumeLevel: volume
            }),
            headers: {
              "Content-Type": "application/json"
            }
          }).catch(() => {});
        }
      } else {
        audioRef.current.pause();
      }
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

      mediaSession.setActionHandler("play", play);
      mediaSession.setActionHandler("pause", pause);

      mediaSession.setActionHandler("previoustrack", previous);
      mediaSession.setActionHandler("nexttrack", next);

      mediaSession.setActionHandler("seekto", (details) => {
        const newTime = details.fastSeek ? details.fastSeek : details.seekTime;
        setPlaybackState((prevState) => ({
          ...prevState,
          position: newTime
        }));
        setPosition(newTime * 1000);
      });

      if (getPWADisplayMode() == "browser" && !isElectron) {
        document.title = `${props.state.item.Name} - ${getArtistDisplay(props.state.item.Artists)} - Finact`;
      } else {
        document.title = "Finact";
      }
    }

    if (isElectron) {
      electron.sendMessage(
        JSON.stringify({
          type: "playback-state-changed",
          state: playbackState,
          queue
        })
      );
    }
  }, [props.state]);

  if (isElectron) {
    useEffect(() => {
      electron.sendMessage(
        JSON.stringify({
          type: "playback-state-changed",
          state: playbackState,
          queue
        })
      );
    }, [queue]);
  }

  function handleTimeUpdate(e) {
    const newTime = e / 1000;
    setPlaybackState((prevState) => ({
      ...prevState,
      position: newTime
    }));
    setPosition(e);
    jellyfinRequest(`/Sessions/Playing/Progress`, {
      method: "POST",
      body: JSON.stringify({
        CanSeek: false,
        ItemId: props.state.item.Id,
        IsPaused: !props.state.playing,
        IsMuted: false,
        PositionTicks: Math.floor(position * 10000),
        VolumeLevel: volume
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }).catch(() => {});
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && !isScrubbing.current) {
        setPosition(audioRef.current.currentTime * 1000);
        if (isElectron) {
          if (!playbackState.playing) return;
          electron.sendMessage(
            JSON.stringify({
              type: "playback-progress",
              position: audioRef.current.currentTime
            })
          );
        }
        localforage.setItem("position", audioRef.current.currentTime * 1000);
      }
    }, 500);
    if (audioRef.current && !isScrubbing.current) {
      setPosition(audioRef.current.currentTime * 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (restoredVolume.current) {
      localforage.setItem("volume", volume);
    }
    localforage.setItem("repeat", repeat);
    if (isElectron) {
      electron.sendMessage(
        JSON.stringify({
          type: "playback-options-changed",
          repeat,
          volume
        })
      );
    }
  }, [volume, repeat]);

  useEffect(() => {
    (async () => {
      const type = lastCommand?.type;
      switch (type) {
        case "play-item":
          const itemData = await jellyfinRequest(`/Items/${lastCommand.itemId}`);
          if (!["Audio", "MusicAlbum", "Playlist"].includes(itemData.Type)) {
            console.warn("Received play command for invalid item type " + itemData.Type);
            return;
          }
          if (itemData.Type == "Audio") {
            playItem(setPlaybackState, setQueue, itemData);
          }
          if (itemData.Type == "MusicAlbum" || itemData.Type == "Playlist") {
            const items = (await jellyfinRequest(`/Items?ParentId=${itemData.Id}${itemData.Type == "MusicAlbum" ? "&SortBy=IndexNumber" : ""}`))?.Items;
            if (items && items.length > 0) {
              playItem(setPlaybackState, setQueue, items[0], items);
            } else {
              console.warn("Received play command for empty album/playlist");
            }
          }
          break;
        case "pause":
          pause();
          break;
        case "resume":
          play();
          break;
        case "stop":
          setPlaybackState(null);
          setQueue(null);
          break;
        case "next":
          next();
          break;
        case "previous":
          previous();
          break;
        case "set-volume":
          if (typeof lastCommand.volume === "number" && lastCommand.volume >= 0 && lastCommand.volume <= 100) {
            setVolume(lastCommand.volume);
          }
          break;
        case "seek":
          if (typeof lastCommand.position === "number") {
            setPlaybackState((prevState) => ({
              ...prevState,
              position: lastCommand.position
            }));
            setPosition(lastCommand.position * 1000);
          }
          break;
        case "set-repeat":
          setRepeat(lastCommand.mode);
          break;
        default:
          break;
      }
    })();
  }, [lastCommand]);

  function play() {
    if (!audioRef.current || !playbackState || !playbackState.item) {
      return;
    }
    setPlaybackState((prevState) => ({
      ...prevState,
      playing: true
    }));
    setPosition(audioRef.current.currentTime * 1000);
    jellyfinRequest(`/Sessions/Playing/Progress`, {
      method: "POST",
      body: JSON.stringify({
        CanSeek: false,
        ItemId: props.state.item.Id,
        IsPaused: false,
        IsMuted: false,
        PositionTicks: Math.floor(position * 10000),
        VolumeLevel: volume
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }).catch(() => {});
  }

  function pause() {
    if (!audioRef.current || !playbackState || !playbackState.item) {
      return;
    }
    setPlaybackState((prevState) => ({
      ...prevState,
      position: audioRef.current.currentTime,
      playing: false
    }));
    setPosition(audioRef.current.currentTime * 1000);
    jellyfinRequest(`/Sessions/Playing/Progress`, {
      method: "POST",
      body: JSON.stringify({
        CanSeek: false,
        ItemId: props.state.item.Id,
        IsPaused: true,
        IsMuted: false,
        PositionTicks: Math.floor(position * 10000),
        VolumeLevel: volume
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }).catch(() => {});
  }

  function next() {
    if (!audioRef.current) return;
    if (queue && queue.items && queue.items.length > 0) {
      if (queue.index == queue.items.length - 1) {
        if (repeat === "all") {
          // loop back to the first song
          const firstItem = queue.items[0];
          setPlaybackState({
            item: firstItem,
            playing: true,
            position: 0
          });
          setQueue({
            items: queue.items,
            index: 0
          });
          return;
        }
        // end playback on the last song
        setPlaybackState(null);
        return;
      }
      const nextItem = queue.items[queue.index + 1];
      setPlaybackState({
        item: nextItem,
        playing: true,
        position: 0
      });
      setQueue({
        items: queue.items,
        index: queue.index + 1
      });
    } else {
      setPlaybackState(null);
    }
  }

  function previous() {
    if (!audioRef.current) return;
    if (queue && audioRef.current.currentTime < 4) {
      if (queue.index == 0) {
        setPlaybackState((prevState) => ({
          ...prevState,
          position: 0
        }));
        return;
      }
      const prevItem = queue.items[queue.index - 1];
      setPlaybackState({
        item: prevItem,
        playing: true,
        position: 0
      });
      setQueue({
        items: queue.items,
        index: queue.index - 1
      });
    } else {
      setPlaybackState((prevState) => ({
        ...prevState,
        position: 0
      }));
    }
  }

  return (
    <>
      <audio
        className="playback-audio"
        ref={audioRef}
        crossOrigin="anonymous"
        src={`${storage.get("serverURL")}/Audio/${props.state.item.Id}/Universal?itemId=${props.state.item.Id}&deviceId=${storage.get("DeviceId")}&userId=${getUser().Id}&Container=opus,webm|opus,ts|mp3,mp3,aac,m4a|aac,m4b|aac,flac,webma,webm|webma,wav,ogg&api_key=${storage.get("AccessToken")}`}
        playsInline={true}
        onEnded={(e) => {
          if (repeat === "one") {
            setPlaybackState((prevState) => ({
              ...prevState,
              position: 0
            }));
            return;
          } else {
            next();
          }
        }}
      />
      {visualizerOpen ? <Visualizer audioContextRef={audioContextRef} gainNodeRef={gainNodeRef} /> : <></>}
      {lyricsOpen && <Lyrics lyrics={fetchedLyrics.current} state={props.state} position={position} />}
      <Footer className={(lyricsOpen || visualizerOpen) && "footer-overlay"}>
        <Navbar className="now-playing" style={{ flexBasis: 0 }}>
          <Scrubber
            min={0}
            max={props.state.item.RunTimeTicks / 10000}
            value={position}
            tooltip={{
              enabledOnHover: true,
              enabledOnScrub: true,
              formatString: (e) => {
                const minutes = Math.floor(e / 1000 / 60);
                const seconds = Math.floor((e / 1000) % 60);
                const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
                const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
                return `${formattedMinutes}:${formattedSeconds}`;
              }
            }}
            onScrubEnd={(e) => {
              handleTimeUpdate(e);
              isScrubbing.current = false;
            }}
            onScrubStart={(e) => {
              // handleTimeUpdate(e);
              setPosition(e);
              isScrubbing.current = true;
            }}
            onScrubChange={setPosition}
          />
          <FlexboxGrid justify="space-around" align="middle">
            <FlexboxGrid.Item
              style={{ flex: 1 }}
              className="pointer"
              onClick={() => {
                if (lyricsOpen) setLyricsOpen(false);
                if (visualizerOpen) setVisualizerOpen(false);
                window.location.hash = "#queue";
              }}
            >
              <HStack spacing={10}>
                <Avatar size="sm" src={getAlbumArt(props.state.item)}>
                  <Icon icon="album" noSpace />
                </Avatar>
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
                <Button appearance="subtle" onClick={previous}>
                  <Icon icon={"skip_previous"} noSpace />
                </Button>
                <Button
                  appearance="subtle"
                  onClick={() => {
                    if (playbackState.playing) {
                      pause();
                    } else {
                      play();
                    }
                  }}
                >
                  <Icon icon={props.state.playing ? "pause" : "play_arrow"} noSpace />
                </Button>
                <Button
                  appearance="subtle"
                  onClick={() => {
                    setPlaybackState(null);
                    setQueue(null);
                  }}
                >
                  <Icon icon={"stop"} noSpace />
                </Button>
                <Button appearance="subtle" onClick={next}>
                  <Icon icon={"skip_next"} noSpace />
                </Button>
              </ButtonGroup>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={{ flex: 1, display: "flex", justifyContent: "flex-end" }} className="now-playing-buttons">
              <HStack spacing={9}>
                <Text muted className="no-select">
                  {formatTimestamp(position / 1000)} / {formatTimestamp(props.state.item.RunTimeTicks / 1e7)}
                </Text>
                {visualizerSupported.current && (
                  <Button
                    className="square"
                    appearance="subtle"
                    title="Toggle Visualizer"
                    onClick={() => {
                      if (lyricsOpen) {
                        setLyricsOpen(false);
                      }
                      setVisualizerOpen(!visualizerOpen);
                    }}
                  >
                    <Icon icon={"music_video"} noSpace />
                  </Button>
                )}
                {(props.state.item.HasLyrics || lyricsOpen) && (
                  <Button
                    className="square"
                    appearance="subtle"
                    title="Lyrics"
                    onClick={async () => {
                      if (!lyricsOpen) {
                        setLyricsOpen(true);
                        if (visualizerOpen) {
                          setVisualizerOpen(false);
                        }
                      } else {
                        setLyricsOpen(false);
                      }
                    }}
                  >
                    <Icon icon={"lyrics"} noSpace />
                  </Button>
                )}
                <Whisper
                  placement="top"
                  trigger="click"
                  preventOverflow={true}
                  speaker={
                    <Popover style={{ width: 200 }}>
                      <Slider progress renderTooltip={() => volume + "%"} defaultValue={100} value={volume} onChange={setVolume} />
                    </Popover>
                  }
                >
                  <Button className="square" appearance="subtle" title="Volume">
                    <Icon icon={volume > 66 ? "volume_up" : volume > 33 ? "volume_down" : "volume_mute"} noSpace />
                  </Button>
                </Whisper>
                <Button
                  className="square"
                  appearance="subtle"
                  title="Repeat"
                  onClick={() => {
                    if (repeat == "none") {
                      setRepeat("all");
                    } else if (repeat == "all") {
                      setRepeat("one");
                    } else {
                      setRepeat("none");
                    }
                  }}
                >
                  <Icon icon={repeat == "one" ? "repeat_one" : "repeat"} style={{ color: repeat !== "none" ? "var(--rs-primary-600)" : "unset" }} noSpace />
                </Button>
                <ItemContextMenu
                  item={props.state.item}
                  type="now-playing"
                  menuButton={
                    <Button appearance="subtle" className="square">
                      <Icon icon="more_vert" noSpace />
                    </Button>
                  }
                />
              </HStack>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Navbar>
      </Footer>
    </>
  );
}
