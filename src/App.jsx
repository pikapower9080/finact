import { useState, createContext, useEffect } from "react";
import { Container, Content, Loader, useToaster } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { SignIn } from "./Components/SignIn";
import { getStorage } from "./storage";
import MainHeader from "./Components/Header";
import { HashRouter, Route, Routes } from "react-router";
import Home from "./Routes/Home";
import Playlists from "./Routes/Playlists";
import Collections from "./Routes/Collections";
import NowPlaying from "./Components/NowPlaying";
import Collection from "./Routes/Collections/:id";
import NotFound from "./Routes/NotFound";
import Playlist from "./Routes/Playlists/:id";
import Album from "./Routes/Albums/:id";
import Search from "./Routes/Search";
import AddToPlaylist from "./Components/AddToPlaylist";

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
  const [loading, setLoading] = useState(false);
  const [addToPlaylistItem, setAddToPlaylistItem] = useState(null);

  const toaster = useToaster();

  const globalState = { playbackState, setPlaybackState, loading, setLoading, toaster, addToPlaylistItem, setAddToPlaylistItem };

  useEffect(() => {
    window.debug = globalState;
  }, [...Object.values(globalState)]);

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
          {playbackState && <NowPlaying state={playbackState} />}
          {loading && <Loader backdrop vertical size="lg" />}
        </Container>
      </GlobalState.Provider>
    </>
  );
}

export default App;
