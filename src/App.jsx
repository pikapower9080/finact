import { useState, createContext, useEffect, useRef } from "react";
import { Container, Content, Loader, useToaster, Notification, Button, Text } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { SignIn } from "./Components/SignIn";
import { getStorage } from "./storage";
import MainHeader from "./Components/Header";
import { HashRouter, Route, Routes } from "react-router";
import Home from "./Routes/Home";
import Playlists from "./Routes/Playlists";
import Collections from "./Routes/Collections";
import NowPlaying from "./Components/NowPlaying";
import Collection from "./Routes/Collections/[id]";
import NotFound from "./Routes/NotFound";
import Playlist from "./Routes/Playlists/[id]";
import Album from "./Routes/Albums/[id]";
import Search from "./Routes/Search";
import AddToPlaylist from "./Components/AddToPlaylist";
import Queue from "./Routes/Queue";
import localforage from "localforage";

const storage = getStorage();

export function getUser() {
  const serverURL = storage.get("serverURL");
  const accessToken = storage.get("AccessToken");
  const user = storage.get("User");
  if (serverURL && accessToken && user) {
    return user;
  } else {
    return null;
  }
}

export const GlobalState = createContext();

function App() {
  const [user, setUser] = useState(getUser);
  const [playbackState, setPlaybackState] = useState(null);
  const [queue, setQueue] = useState({});
  const [loading, setLoading] = useState(false);
  const [addToPlaylistItem, setAddToPlaylistItem] = useState(null);
  const queueAndStateInitialized = useRef(false);

  const toaster = useToaster();

  const globalState = { playbackState, setPlaybackState, loading, setLoading, toaster, addToPlaylistItem, setAddToPlaylistItem, queue, setQueue };

  useEffect(() => {
    (async () => {
      if (user) {
        const savedState = await localforage.getItem("playbackState");
        const savedQueue = await localforage.getItem("queue");
        let restoredState = false;
        let restoredQueue = false;
        if (savedState) {
          if ("playing" in savedState) {
            savedState.playing = false;
          }
          setPlaybackState(savedState);
          console.log("Restoring playback state");
          restoredState = true;
        }
        if (savedQueue) {
          setQueue(savedQueue);
          console.log("Restoring queue");
          restoredQueue = true;
        }
        queueAndStateInitialized.current = true;
        if (restoredState || restoredQueue) {
          toaster.push(
            <Notification closable type="info" header="Success">
              <Text>{`The ${restoredState ? "current track" : ""}${restoredState && restoredQueue ? " and " : ""}${restoredQueue ? "queue" : ""} ${restoredState && restoredQueue ? " were " : "was"} restored successfully.`}</Text>
              <Button
                style={{ marginTop: 8 }}
                onClick={() => {
                  setPlaybackState(null);
                  setQueue(null);
                  toaster.clear();
                }}
              >
                Undo
              </Button>
            </Notification>,
            {
              duration: 4000
            }
          );
        }
      }
    })();
  }, []);

  useEffect(() => {
    window.debug = { ...globalState, storage, localforage };
  }, [...Object.values(globalState)]);

  useEffect(() => {
    if (!queueAndStateInitialized.current) {
      return;
    }
    localforage.setItem("playbackState", playbackState);
    localforage.setItem("queue", queue);
  }, [playbackState, queue]);

  return (
    <>
      <GlobalState.Provider value={globalState}>
        <Container style={{ height: "100%" }}>
          <MainHeader user={user} />
          <Content>
            {!user ? (
              <SignIn setUser={setUser} />
            ) : (
              <>
                <AddToPlaylist item={addToPlaylistItem} />
                <HashRouter>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/queue" element={<Queue />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/playlists/:id" element={<Playlist />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/collections/:id" element={<Collection />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/albums/:id" element={<Album />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </HashRouter>
              </>
            )}
          </Content>
          {user && playbackState && <NowPlaying state={playbackState} />}
          {loading && <Loader backdrop vertical size="lg" />}
        </Container>
      </GlobalState.Provider>
    </>
  );
}

export default App;
