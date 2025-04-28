import { useState } from "react";
import { Container, Content } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { SignIn } from "./Components/SignIn";
import { getStorage } from "./storage";
import MainHeader from "./Components/Header";

const storage = getStorage();

function App() {
  const [user, setUser] = useState(() => {
    const serverURL = storage.get("serverURL");
    const accessToken = storage.get("AccessToken");
    const user = storage.get("User");
    if (serverURL && accessToken && user) {
      return user;
    } else {
      return null;
    }
  });

  return (
    <>
      <Container style={{ height: "100%" }}>
        <MainHeader user={user} />
        <Content>{!user ? <SignIn setUser={setUser} /> : ""}</Content>
      </Container>
    </>
  );
}

export default App;
