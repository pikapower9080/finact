import { useEffect, useState } from "react";
import { Container, Content } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { SignIn } from "./Components/SignIn";
import { getStorage } from "./storage";
import MainHeader from "./Components/Header";
import { HashRouter, Route, Routes } from "react-router";
import Home from "./Components/Home";
import Playlists from "./Components/Playlists";
import Collections from "./Components/Collections";

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

function App() {
  const [user, setUser] = useState(getUser);

  return (
    <>
      <Container style={{ height: "100%" }}>
        <MainHeader user={user} />
        <Content>
          {!user ? (
            <SignIn setUser={setUser} />
          ) : (
            <HashRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/collections" element={<Collections />} />
              </Routes>
            </HashRouter>
          )}
        </Content>
      </Container>
    </>
  );
}

export default App;
